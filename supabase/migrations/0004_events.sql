-- Milestones 6–8: supply shop, Storm Zone + host awards, Base Camp prep bonus, Final Ascent, Buzzer mode.
-- Run after 0003_play.sql (SQL Editor → New query → paste → Run).

-- The storm card everyone sees during STORM_EVENT.
alter table public.sessions add column if not exists public_card jsonb;

-- Supply costs; keep in step with src/lib/supplies.ts.
create or replace function public.supply_cost(p_items text[])
returns integer
language sql
immutable
as $$
  select coalesce(sum(case i
    when 'map' then 3 when 'layers' then 3 when 'radio' then 2
    when 'food' then 2 when 'kit' then 3 when 'rope' then 4
  end), 0)::integer
  from unnest(p_items) as i;
$$;

-- ─────────────────────────────────────────────────────────────
-- Checkpoint 1: supply shop
-- ─────────────────────────────────────────────────────────────

create or replace function public.host_open_shop(p_session uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s sessions := host_session(p_session);
begin
  update sessions set state = 'SUPPLY_SHOP', phase_started_at = now(), started_at = coalesce(started_at, now())
   where id = v_s.id;
end;
$$;

-- Any team member can add or drop an item; the team shares one pack. Never over budget.
create or replace function public.toggle_supply(p_token uuid, p_item text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p     players;
  v_t     teams;
  v_items text[];
begin
  select * into v_p from players where session_token = p_token;
  if not found then
    raise exception 'We lost your spot. Rejoin with the game PIN.';
  end if;
  if (select state from sessions where id = v_p.session_id) <> 'SUPPLY_SHOP' then
    raise exception 'The supply shop is closed.';
  end if;
  select * into v_t from teams where id = v_p.team_id for update;
  if v_t.supplies_locked then
    raise exception 'Your team already locked in. Tap Change supplies first.';
  end if;

  if p_item = any (v_t.supplies) then
    v_items := array_remove(v_t.supplies, p_item);
  else
    if p_item not in ('map', 'layers', 'radio', 'food', 'kit', 'rope') then
      raise exception 'That isn''t in the shop.';
    end if;
    v_items := v_t.supplies || p_item;
    if supply_cost(v_items) > 10 then
      raise exception 'Not enough points. Drop something first.';
    end if;
  end if;
  update teams set supplies = v_items where id = v_t.id;
end;
$$;

create or replace function public.lock_supplies(p_token uuid, p_locked boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p players;
begin
  select * into v_p from players where session_token = p_token;
  if not found then
    raise exception 'We lost your spot. Rejoin with the game PIN.';
  end if;
  if (select state from sessions where id = v_p.session_id) <> 'SUPPLY_SHOP' then
    raise exception 'The supply shop is closed.';
  end if;
  update teams set supplies_locked = p_locked where id = v_p.team_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Questions (replaces the 0003 versions: shop close, buzzer turns, bonuses)
-- ─────────────────────────────────────────────────────────────

create or replace function public.host_start_question(p_session uuid, p_question uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s      sessions := host_session(p_session);
  v_q      questions;
  v_number integer;
  v_total  integer;
  v_timer  integer;
begin
  select * into v_q from questions where id = p_question and game_id = v_s.game_id;
  if not found then
    raise exception 'That question isn''t in this game.';
  end if;

  -- Closing the shop packs whatever each team had chosen.
  if v_s.state = 'SUPPLY_SHOP' then
    update teams set supplies_locked = true where session_id = p_session and not supplies_locked;
  end if;

  select count(*) filter (where (checkpoint, position) <= (v_q.checkpoint, v_q.position)), count(*)
    into v_number, v_total
    from questions where game_id = v_s.game_id;

  v_timer := case
    when v_q.type = 'final_scenario' then v_q.timer_seconds
    when v_s.mode = 'buzzer' then v_s.timer_seconds        -- seconds for each team's turn
    when v_s.timer_seconds > 0 then v_s.timer_seconds       -- one timer for every question
    else v_q.timer_seconds
  end;

  update sessions set
    state = 'QUESTION',
    current_question_id = v_q.id,
    phase_started_at = now(),
    started_at = coalesce(started_at, now()),
    public_card = null,
    public_question = jsonb_build_object(
      'id', v_q.id,
      'number', v_number,
      'total', v_total,
      'checkpoint', v_q.checkpoint,
      'type', v_q.type,
      'topic', v_q.topic,
      'prompt', v_q.prompt,
      'options', to_jsonb(v_q.options),
      'timer_seconds', v_timer,
      'mode', v_s.mode,
      -- Buzzer mode: teams in the order they finished the flag puzzle, whose turn it is, who missed.
      'buzz', '[]'::jsonb,
      'missed', '[]'::jsonb,
      'turn_team', null,
      'turn_started_at', null
    )
  where id = p_session;
end;
$$;

create or replace function public.host_reveal(p_session uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s      sessions := host_session(p_session);
  v_q      questions;
  v_counts integer[];
  v_gained jsonb;
  v_prep   jsonb;
begin
  if v_s.state <> 'QUESTION' then
    return; -- already revealed (double click)
  end if;
  select * into v_q from questions where id = v_s.current_question_id;

  select coalesce(array_agg(coalesce(c.n, 0) order by i), '{}')
    into v_counts
    from generate_series(0, greatest(cardinality(v_q.options), 1) - 1) as i
    left join (
      select option_index, count(*)::integer as n
        from answers where session_id = p_session and question_id = v_q.id
       group by option_index
    ) c on c.option_index = i;

  update teams t set points = t.points + a.points_awarded
    from answers a
   where a.session_id = p_session and a.question_id = v_q.id and a.team_id = t.id and a.points_awarded > 0;

  -- Base Camp prep bonus (+5 supply token): packed well (8+ of 10 supply points) and got a Base Camp question right. Once per team.
  if v_q.checkpoint = 1 then
    with ins as (
      insert into awards (session_id, team_id, reason, points)
      select p_session, t.id, 'prep', 5
        from teams t
        join answers a on a.team_id = t.id and a.session_id = p_session and a.question_id = v_q.id and a.correct
       where t.session_id = p_session and supply_cost(t.supplies) >= 8
         and not exists (select 1 from awards w where w.session_id = p_session and w.team_id = t.id and w.reason = 'prep')
      returning team_id, points
    )
    update teams t set points = t.points + ins.points from ins where t.id = ins.team_id;
  end if;

  -- Every team gets +10 for completing the Final Ascent.
  if v_q.type = 'final_scenario' then
    with ins as (
      insert into awards (session_id, team_id, reason, points)
      select p_session, t.id, 'final_ascent', 10
        from teams t
       where t.session_id = p_session
         and not exists (select 1 from awards w where w.session_id = p_session and w.team_id = t.id and w.reason = 'final_ascent')
      returning team_id, points
    )
    update teams t set points = t.points + ins.points from ins where t.id = ins.team_id;
  end if;

  -- Points this round: the answer plus any awards since the question opened (bonuses, host taps).
  select coalesce(jsonb_object_agg(t.team_key, coalesce(a.points_awarded, 0) + coalesce(w.pts, 0)), '{}')
    into v_gained
    from teams t
    left join answers a on a.team_id = t.id and a.session_id = p_session and a.question_id = v_q.id
    left join (
      select team_id, sum(points)::integer as pts from awards
       where session_id = p_session and created_at >= v_s.phase_started_at
       group by team_id
    ) w on w.team_id = t.id
   where t.session_id = p_session;

  select coalesce(jsonb_object_agg(t.team_key, w.points), '{}')
    into v_prep
    from awards w join teams t on t.id = w.team_id
   where w.session_id = p_session and w.reason = 'prep' and w.created_at = now();

  update sessions set
    state = 'REVEAL',
    phase_started_at = now(),
    public_question = public_question || jsonb_build_object(
      'correct_index', v_q.correct_index,
      'reveal_title', v_q.reveal_title,
      'trail_fact', v_q.trail_fact,
      'team_counts', to_jsonb(v_counts),
      'gained', v_gained,
      'prep', v_prep
    )
  where id = p_session;
end;
$$;

-- First tap from a team locks the team's answer. In Buzzer mode only the team whose turn it is may answer.
create or replace function public.submit_answer(p_token uuid, p_option integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p       players;
  v_s       sessions;
  v_q       questions;
  v_key     text;
  v_timer   numeric;
  v_elapsed numeric;
  v_correct boolean;
  v_points  integer := 0;
begin
  select * into v_p from players where session_token = p_token;
  if not found then
    raise exception 'We lost your spot. Rejoin with the game PIN.';
  end if;
  select * into v_s from sessions where id = v_p.session_id;
  if v_s.state <> 'QUESTION' or v_s.current_question_id is null then
    raise exception 'Answers are closed for this question.';
  end if;
  select * into v_q from questions where id = v_s.current_question_id;
  if v_q.type = 'final_scenario' then
    raise exception 'This one is talked through out loud.';
  end if;
  if p_option < 0 or p_option >= cardinality(v_q.options) then
    raise exception 'Pick one of the trails.';
  end if;

  v_timer := (v_s.public_question ->> 'timer_seconds')::numeric;
  if v_s.public_question ->> 'mode' = 'buzzer' then
    select team_key into v_key from teams where id = v_p.team_id;
    if v_s.public_question ->> 'turn_team' is distinct from v_key then
      raise exception 'Wait for your team''s turn.';
    end if;
    v_elapsed := extract(epoch from now() - (v_s.public_question ->> 'turn_started_at')::timestamptz);
  else
    v_elapsed := extract(epoch from now() - v_s.phase_started_at);
  end if;
  if v_elapsed > v_timer + 2 then -- 2 s grace for slow phones
    raise exception 'Time''s up for this question.';
  end if;

  v_correct := p_option = v_q.correct_index;
  if v_correct then
    v_points := 10;
    if v_s.mode = 'buttons' then
      v_points := v_points + greatest(0, least(5, round(5 * (1 - v_elapsed / v_timer))))::integer;
    end if;
  end if;

  insert into answers (session_id, question_id, team_id, player_id, option_index, correct, points_awarded)
  values (v_s.id, v_q.id, v_p.team_id, v_p.id, p_option, v_correct, v_points)
  on conflict (session_id, question_id, team_id) do nothing;

  update teams set answered_question_id = v_q.id
   where id = v_p.team_id and answered_question_id is distinct from v_q.id;

  return my_team_answer(p_token);
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Buzzer mode
-- ─────────────────────────────────────────────────────────────

-- A team finished the flag puzzle. Server receive order decides the buzz order (never phone clocks).
create or replace function public.buzz_in(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p   players;
  v_s   sessions;
  v_key text;
  v_pq  jsonb;
begin
  select * into v_p from players where session_token = p_token;
  if not found then
    raise exception 'We lost your spot. Rejoin with the game PIN.';
  end if;
  -- Lock the session row so two teams finishing together get different places.
  select * into v_s from sessions where id = v_p.session_id for update;
  if v_s.state <> 'QUESTION' or v_s.public_question ->> 'mode' is distinct from 'buzzer' then
    raise exception 'Buzzing is closed.';
  end if;
  select team_key into v_key from teams where id = v_p.team_id;
  v_pq := v_s.public_question;
  if v_pq -> 'buzz' ? v_key then
    return; -- a teammate already buzzed
  end if;

  insert into buzz_order (session_id, question_id, team_id, position)
  values (v_s.id, v_s.current_question_id, v_p.team_id, jsonb_array_length(v_pq -> 'buzz') + 1)
  on conflict do nothing;

  v_pq := jsonb_set(v_pq, '{buzz}', (v_pq -> 'buzz') || to_jsonb(v_key));
  if v_pq ->> 'turn_team' is null and not (v_pq -> 'missed' ? v_key) then
    v_pq := v_pq || jsonb_build_object('turn_team', v_key, 'turn_started_at', now());
  end if;
  update sessions set public_question = v_pq where id = v_s.id;
end;
$$;

-- Host: "Wrong → next team". No points lost; the next team in buzz order gets its turn.
create or replace function public.host_next_turn(p_session uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s      sessions := host_session(p_session);
  v_pq     jsonb := v_s.public_question;
  v_missed jsonb;
  v_next   text;
begin
  if v_s.state <> 'QUESTION' or v_pq ->> 'turn_team' is null then
    return;
  end if;
  v_missed := (v_pq -> 'missed') || to_jsonb(v_pq ->> 'turn_team');
  select b.value into v_next
    from jsonb_array_elements_text(v_pq -> 'buzz') with ordinality as b(value, n)
   where not (v_missed ? b.value)
   order by b.n
   limit 1;
  v_pq := v_pq || jsonb_build_object(
    'missed', v_missed,
    'turn_team', v_next,
    'turn_started_at', case when v_next is null then null else now() end
  );
  update sessions set public_question = v_pq where id = v_s.id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Checkpoint 3: Storm Zone, and host-awarded points
-- ─────────────────────────────────────────────────────────────

create or replace function public.host_start_storm(p_session uuid, p_card uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s      sessions := host_session(p_session);
  v_c      storm_cards;
  v_number integer;
  v_total  integer;
begin
  select * into v_c from storm_cards where id = p_card and game_id = v_s.game_id;
  if not found then
    raise exception 'That storm card isn''t in this game.';
  end if;
  select count(*) filter (where position <= v_c.position), count(*)
    into v_number, v_total
    from storm_cards where game_id = v_s.game_id;

  -- Teams that packed the helpful supply get +5 when the card is drawn.
  if v_c.helpful_supply is not null and v_s.current_storm_id is distinct from v_c.id then
    with ins as (
      insert into awards (session_id, team_id, reason, points)
      select p_session, t.id, 'supply', 5 from teams t
       where t.session_id = p_session and v_c.helpful_supply = any (t.supplies)
      returning team_id, points
    )
    update teams t set points = t.points + ins.points from ins where t.id = ins.team_id;
  end if;

  update sessions set
    state = 'STORM_EVENT',
    current_storm_id = v_c.id,
    phase_started_at = now(),
    public_card = jsonb_build_object(
      'id', v_c.id,
      'number', v_number,
      'total', v_total,
      'title', v_c.title,
      'body', v_c.body,
      'helpful_supply', v_c.helpful_supply,
      'seconds', 120
    )
  where id = v_s.id;
end;
$$;

-- Host scorecard taps: +10 plan, +5 reasoning, +5 backup, +5 teamwork.
create or replace function public.host_award(p_session uuid, p_team uuid, p_reason text, p_points integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s sessions := host_session(p_session);
begin
  if p_reason not in ('plan', 'reasoning', 'backup', 'teamwork') or p_points not between 1 and 10 then
    raise exception 'That award isn''t on the scorecard.';
  end if;
  update teams set points = points + p_points where id = p_team and session_id = v_s.id;
  if not found then
    raise exception 'That team isn''t in this game.';
  end if;
  insert into awards (session_id, team_id, reason, points) values (v_s.id, p_team, p_reason, p_points);
end;
$$;

-- "Reset this round": takes back the scorecard taps made since the current screen opened.
create or replace function public.host_reset_awards(p_session uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s sessions := host_session(p_session);
begin
  with del as (
    delete from awards
     where session_id = v_s.id and reason in ('plan', 'reasoning', 'backup', 'teamwork')
       and created_at >= v_s.phase_started_at
    returning team_id, points
  )
  update teams t set points = t.points - d.pts
    from (select team_id, sum(points)::integer as pts from del group by team_id) d
   where t.id = d.team_id;
end;
$$;

revoke all on function public.host_open_shop(uuid) from public;
revoke all on function public.toggle_supply(uuid, text) from public;
revoke all on function public.lock_supplies(uuid, boolean) from public;
revoke all on function public.buzz_in(uuid) from public;
revoke all on function public.host_next_turn(uuid) from public;
revoke all on function public.host_start_storm(uuid, uuid) from public;
revoke all on function public.host_award(uuid, uuid, text, integer) from public;
revoke all on function public.host_reset_awards(uuid) from public;

grant execute on function public.host_open_shop(uuid) to authenticated;
grant execute on function public.toggle_supply(uuid, text) to anon, authenticated;
grant execute on function public.lock_supplies(uuid, boolean) to anon, authenticated;
grant execute on function public.buzz_in(uuid) to anon, authenticated;
grant execute on function public.host_next_turn(uuid) to authenticated;
grant execute on function public.host_start_storm(uuid, uuid) to authenticated;
grant execute on function public.host_award(uuid, uuid, text, integer) to authenticated;
grant execute on function public.host_reset_awards(uuid) to authenticated;

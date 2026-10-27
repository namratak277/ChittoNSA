-- Milestone 5: the game state machine, Buttons-mode answering, scoring and the reveal.
-- Run after 0002_join.sql (SQL Editor → New query → paste → Run).
--
-- The server owns the game: the host's buttons call host_* functions, phones call submit_answer,
-- and everyone follows the sessions row over Realtime. Points are added at the reveal so the
-- scoreboard never gives the answer away early.

-- What phones may see of the current question. The right answer is only added at the reveal.
alter table public.sessions add column if not exists public_question jsonb;
-- Which question the team last locked an answer for (not which answer), so the host can count.
alter table public.teams add column if not exists answered_question_id uuid;
-- Only that a plan was made, never what's in it.
alter table public.players add column if not exists plan_made boolean not null default false;

-- Phones use this to line their countdown up with the server clock.
create or replace function public.server_now()
returns timestamptz
language sql
stable
as $$ select now() $$;

-- ─────────────────────────────────────────────────────────────
-- Host controls (signed-in maker who opened the session)
-- ─────────────────────────────────────────────────────────────

create or replace function public.host_session(p_session uuid)
returns sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v sessions;
begin
  select * into v from sessions where id = p_session and maker_id = auth.uid() for update;
  if not found then
    raise exception 'Only the host of this game can do that.';
  end if;
  return v;
end;
$$;

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

  select count(*) filter (where (checkpoint, position) <= (v_q.checkpoint, v_q.position)), count(*)
    into v_number, v_total
    from questions where game_id = v_s.game_id;

  -- Buttons mode: the host can set one timer for every question (0 = each question's own timer).
  v_timer := case
    when v_q.type <> 'final_scenario' and v_s.mode = 'buttons' and v_s.timer_seconds > 0 then v_s.timer_seconds
    else v_q.timer_seconds
  end;

  update sessions set
    state = 'QUESTION',
    current_question_id = v_q.id,
    phase_started_at = now(),
    started_at = coalesce(started_at, now()),
    public_question = jsonb_build_object(
      'id', v_q.id,
      'number', v_number,
      'total', v_total,
      'checkpoint', v_q.checkpoint,
      'type', v_q.type,
      'topic', v_q.topic,
      'prompt', v_q.prompt,
      'options', to_jsonb(v_q.options),
      'timer_seconds', v_timer
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
begin
  if v_s.state <> 'QUESTION' then
    return; -- already revealed (double click)
  end if;
  select * into v_q from questions where id = v_s.current_question_id;

  -- How many teams picked each answer.
  select coalesce(array_agg(coalesce(c.n, 0) order by i), '{}')
    into v_counts
    from generate_series(0, greatest(cardinality(v_q.options), 1) - 1) as i
    left join (
      select option_index, count(*)::integer as n
        from answers where session_id = p_session and question_id = v_q.id
       group by option_index
    ) c on c.option_index = i;

  -- Points were worked out when each team answered; they count from now.
  update teams t set points = t.points + a.points_awarded
    from answers a
   where a.session_id = p_session and a.question_id = v_q.id and a.team_id = t.id and a.points_awarded > 0;

  select coalesce(jsonb_object_agg(t.team_key, coalesce(a.points_awarded, 0)), '{}')
    into v_gained
    from teams t
    left join answers a on a.team_id = t.id and a.session_id = p_session and a.question_id = v_q.id
   where t.session_id = p_session;

  update sessions set
    state = 'REVEAL',
    phase_started_at = now(),
    public_question = public_question || jsonb_build_object(
      'correct_index', v_q.correct_index,
      'reveal_title', v_q.reveal_title,
      'trail_fact', v_q.trail_fact,
      'team_counts', to_jsonb(v_counts),
      'gained', v_gained
    )
  where id = p_session;
end;
$$;

-- Moves between the screens that need no extra work (Summit Champions, voting plan, end).
create or replace function public.host_set_state(p_session uuid, p_state text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s sessions := host_session(p_session);
begin
  if p_state not in ('LOBBY', 'RESULTS', 'VOTING_PLAN', 'ENDED') then
    raise exception 'Use the game controls for that step.';
  end if;
  update sessions set state = p_state, phase_started_at = now() where id = v_s.id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Phones (no account; identified by their reconnect token)
-- ─────────────────────────────────────────────────────────────

-- The answer locked in for the player's team on the current question, or null.
create or replace function public.my_team_answer(p_token uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'question_id', a.question_id,
    'option_index', a.option_index,
    'answered_by', by_player.nickname,
    'mine', a.player_id = p.id
  )
  from players p
  join sessions s on s.id = p.session_id
  join answers a on a.session_id = s.id and a.question_id = s.current_question_id and a.team_id = p.team_id
  left join players by_player on by_player.id = a.player_id
  where p.session_token = p_token;
$$;

-- First tap from a team locks the team's answer. Timing uses the server clock only.
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
  v_elapsed := extract(epoch from now() - v_s.phase_started_at);
  if v_elapsed > v_timer + 2 then -- 2 s grace for slow phones
    raise exception 'Time''s up for this question.';
  end if;

  v_correct := p_option = v_q.correct_index;
  if v_correct then
    v_points := 10;
    if v_s.mode = 'buttons' then
      -- Speed bonus: up to +5, less the longer the team takes.
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

-- Counts one voting plan per player. The plan itself never leaves the phone.
create or replace function public.record_voting_plan(p_token uuid)
returns void
language sql
security definer
set search_path = public
as $$
  with made as (
    update players set plan_made = true
     where session_token = p_token and not plan_made
    returning session_id
  )
  update sessions s set voting_plans = s.voting_plans + 1
    from made where s.id = made.session_id;
$$;

-- Team stats for the phone's end screen (team results only, nothing personal).
create or replace function public.team_stats(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_p      players;
  v_total  integer := 0;
  v_right  integer := 0;
  v_streak integer := 0;
  v_best   integer := 0;
  r        record;
begin
  select * into v_p from players where session_token = p_token;
  if not found then
    return null;
  end if;
  -- Questions in the order they were played, and whether this team got each one right.
  for r in
    select coalesce(bool_or(a.team_id = v_p.team_id and a.correct), false) as ok
      from answers a
     where a.session_id = v_p.session_id
     group by a.question_id
     order by min(a.received_at)
  loop
    v_total := v_total + 1;
    if r.ok then
      v_right := v_right + 1;
      v_streak := v_streak + 1;
      v_best := greatest(v_best, v_streak);
    else
      v_streak := 0;
    end if;
  end loop;
  return jsonb_build_object('correct', v_right, 'questions', v_total, 'best_streak', v_best, 'plan_made', v_p.plan_made);
end;
$$;

revoke all on function public.host_session(uuid) from public, anon, authenticated;
revoke all on function public.host_start_question(uuid, uuid) from public;
revoke all on function public.host_reveal(uuid) from public;
revoke all on function public.host_set_state(uuid, text) from public;
revoke all on function public.my_team_answer(uuid) from public;
revoke all on function public.submit_answer(uuid, integer) from public;
revoke all on function public.record_voting_plan(uuid) from public;
revoke all on function public.team_stats(uuid) from public;

grant execute on function public.server_now() to anon, authenticated;
grant execute on function public.host_start_question(uuid, uuid) to authenticated;
grant execute on function public.host_reveal(uuid) to authenticated;
grant execute on function public.host_set_state(uuid, text) to authenticated;
grant execute on function public.my_team_answer(uuid) to anon, authenticated;
grant execute on function public.submit_answer(uuid, integer) to anon, authenticated;
grant execute on function public.record_voting_plan(uuid) to anon, authenticated;
grant execute on function public.team_stats(uuid) to anon, authenticated;

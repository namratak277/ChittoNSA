-- Milestone 4: players join a live session with PIN + nickname, and reconnect with their saved token.
-- Run after 0001_schema.sql (SQL Editor → New query → paste → Run).
--
-- Players have no account, so they can't write tables directly. These functions run with the
-- owner's rights and check everything themselves. Only nickname, team and climber style are stored.

create or replace function public.join_session(p_pin text, p_nickname text, p_team_key text, p_style text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session  sessions;
  v_team     teams;
  v_player   players;
  v_nickname text := btrim(coalesce(p_nickname, ''));
begin
  select * into v_session from sessions where pin = p_pin and state <> 'ENDED';
  if not found then
    raise exception 'No game with that PIN is open. Check the big screen.';
  end if;

  if char_length(v_nickname) not between 1 and 24 then
    raise exception 'Pick a nickname of up to 24 characters.';
  end if;
  if p_style not in ('topi', 'headlamp') then
    raise exception 'Pick a climber.';
  end if;

  -- Lock the team row so member counts and the first climber style stay right when phones join at once.
  select * into v_team from teams where session_id = v_session.id and team_key = p_team_key for update;
  if not found then
    raise exception 'That team isn''t playing tonight. Pick another flag.';
  end if;

  if exists (select 1 from players where session_id = v_session.id and lower(nickname) = lower(v_nickname)) then
    raise exception 'Someone already has that nickname. Try another one.';
  end if;

  insert into players (session_id, team_id, nickname, climber_style)
  values (v_session.id, v_team.id, v_nickname, p_style)
  returning * into v_player;

  update teams
     set members = members + 1,
         marker_style = coalesce(marker_style, p_style)
   where id = v_team.id;

  return json_build_object(
    'token', v_player.session_token,
    'session_id', v_session.id,
    'pin', v_session.pin,
    'team_key', v_team.team_key,
    'nickname', v_player.nickname,
    'climber_style', v_player.climber_style
  );
end;
$$;

-- Reopening the link on the same phone rejoins the same team and climber. Returns null if the game is over.
create or replace function public.rejoin_session(p_token uuid)
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'token', p.session_token,
    'session_id', s.id,
    'pin', s.pin,
    'team_key', t.team_key,
    'nickname', p.nickname,
    'climber_style', p.climber_style
  )
  from players p
  join sessions s on s.id = p.session_id
  join teams t on t.id = p.team_id
  where p.session_token = p_token and s.state <> 'ENDED';
$$;

revoke all on function public.join_session(text, text, text, text) from public;
revoke all on function public.rejoin_session(uuid) from public;
grant execute on function public.join_session(text, text, text, text) to anon, authenticated;
grant execute on function public.rejoin_session(uuid) to anon, authenticated;

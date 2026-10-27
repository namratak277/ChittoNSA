-- Chhito! database schema.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- Later milestones add more files in this folder; run them in number order.
--
-- Privacy (README §1): players are stored as nickname + team only. Voting plans are never
-- stored, only a count. Nothing here records who anyone votes for.

-- ─────────────────────────────────────────────────────────────
-- Game content (owned by a maker)
-- ─────────────────────────────────────────────────────────────

create table public.games (
  id            uuid primary key default gen_random_uuid(),
  maker_id      uuid not null default auth.uid() references auth.users on delete cascade,
  title         text not null default 'Untitled game',
  default_mode  text not null default 'buttons' check (default_mode in ('buttons', 'buzzer')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index games_maker_idx on public.games (maker_id);

-- Checkpoint names and voting lessons are fixed by the story (src/lib/checkpoints.ts),
-- so questions just carry the checkpoint number. Summit (5) has no questions.
create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  game_id        uuid not null references public.games on delete cascade,
  checkpoint     smallint not null check (checkpoint between 1 and 4),
  position       integer not null default 0,
  type           text not null default 'multiple_choice'
                 check (type in ('multiple_choice', 'info_cards', 'final_scenario')),
  topic          text not null default 'nepal' check (topic in ('nepal', 'voting')),
  prompt         text not null default '',
  -- 4 options for multiple choice, 2–4 info cards; empty for the final scenario (host-scored).
  options        text[] not null default '{}',
  correct_index  smallint check (correct_index between 0 and 3),
  reveal_title   text,
  trail_fact     text,
  timer_seconds  smallint not null default 20 check (timer_seconds between 5 and 300)
);
create index questions_game_idx on public.questions (game_id, checkpoint, position);

create table public.storm_cards (
  id              uuid primary key default gen_random_uuid(),
  game_id         uuid not null references public.games on delete cascade,
  position        integer not null default 0,
  title           text not null default '',
  body            text not null default '',
  -- Supply id from src/lib/supplies.ts that earns a bonus on this card, if any.
  helpful_supply  text check (helpful_supply in ('map', 'layers', 'radio', 'food', 'kit', 'rope'))
);
create index storm_cards_game_idx on public.storm_cards (game_id, position);

-- ─────────────────────────────────────────────────────────────
-- Live sessions (one per game night)
-- ─────────────────────────────────────────────────────────────

create table public.sessions (
  id                   uuid primary key default gen_random_uuid(),
  game_id              uuid not null references public.games on delete cascade,
  maker_id             uuid not null default auth.uid() references auth.users on delete cascade,
  pin                  text not null check (pin ~ '^[0-9]{6}$'),
  mode                 text not null default 'buttons' check (mode in ('buttons', 'buzzer')),
  timer_seconds        smallint not null default 20,
  team_count           smallint not null default 5 check (team_count in (4, 5, 6)),
  state                text not null default 'LOBBY' check (state in
                         ('LOBBY', 'SUPPLY_SHOP', 'QUESTION', 'REVEAL', 'STORM_EVENT',
                          'RESULTS', 'VOTING_PLAN', 'ENDED')),
  current_question_id  uuid references public.questions on delete set null,
  current_storm_id     uuid references public.storm_cards on delete set null,
  -- Server time the current question / timer started (never trust client clocks).
  phase_started_at     timestamptz,
  -- Host-filled placeholders ([PRIZE], [ELECTION DATE] …). Never invent values.
  settings             jsonb not null default '{}',
  -- Count only. The plan itself stays on the player's phone.
  voting_plans         integer not null default 0,
  started_at           timestamptz,
  created_at           timestamptz not null default now()
);
-- A PIN is unique while its session is live.
create unique index sessions_live_pin_idx on public.sessions (pin) where state <> 'ENDED';
create index sessions_game_idx on public.sessions (game_id);

create table public.teams (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.sessions on delete cascade,
  team_key         text not null check (team_key in ('blue', 'white', 'red', 'green', 'yellow', 'orange')),
  name             text not null,
  position         smallint not null,
  points           integer not null default 0,
  members          integer not null default 0,
  -- Climber style of the first player who joined.
  marker_style     text check (marker_style in ('topi', 'headlamp')),
  supplies         text[] not null default '{}',
  supplies_locked  boolean not null default false,
  unique (session_id, team_key)
);

create table public.players (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.sessions on delete cascade,
  team_id        uuid not null references public.teams on delete cascade,
  nickname       text not null check (char_length(nickname) between 1 and 24),
  climber_style  text not null check (climber_style in ('topi', 'headlamp')),
  -- Secret kept in the player's localStorage for reconnecting. Never readable by other players.
  session_token  uuid not null unique default gen_random_uuid(),
  joined_at      timestamptz not null default now()
);
create index players_session_idx on public.players (session_id);

create table public.answers (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.sessions on delete cascade,
  question_id     uuid not null references public.questions on delete cascade,
  team_id         uuid not null references public.teams on delete cascade,
  player_id       uuid references public.players on delete set null,
  option_index    smallint not null,
  received_at     timestamptz not null default now(),
  correct         boolean not null,
  points_awarded  integer not null default 0,
  -- First tap from a team locks that team's answer.
  unique (session_id, question_id, team_id)
);

create table public.buzz_order (
  session_id   uuid not null references public.sessions on delete cascade,
  question_id  uuid not null references public.questions on delete cascade,
  team_id      uuid not null references public.teams on delete cascade,
  position     smallint not null,
  received_at  timestamptz not null default now(),
  primary key (session_id, question_id, team_id),
  unique (session_id, question_id, position)
);

create table public.awards (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions on delete cascade,
  team_id     uuid not null references public.teams on delete cascade,
  reason      text not null check (reason in ('plan', 'reasoning', 'backup', 'teamwork', 'prep', 'final_ascent', 'supply')),
  points      integer not null check (points >= 0),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Row-level security
-- Makers read/write only their own games and sessions.
-- Players have no account: they can read live session + team boards (no personal info),
-- and every player write goes through checked database functions added in later files.
-- ─────────────────────────────────────────────────────────────

alter table public.games       enable row level security;
alter table public.questions   enable row level security;
alter table public.storm_cards enable row level security;
alter table public.sessions    enable row level security;
alter table public.teams       enable row level security;
alter table public.players     enable row level security;
alter table public.answers     enable row level security;
alter table public.buzz_order  enable row level security;
alter table public.awards      enable row level security;

create policy "makers manage own games" on public.games
  for all to authenticated
  using (maker_id = auth.uid()) with check (maker_id = auth.uid());

create policy "makers manage own questions" on public.questions
  for all to authenticated
  using (exists (select 1 from public.games g where g.id = game_id and g.maker_id = auth.uid()))
  with check (exists (select 1 from public.games g where g.id = game_id and g.maker_id = auth.uid()));

create policy "makers manage own storm cards" on public.storm_cards
  for all to authenticated
  using (exists (select 1 from public.games g where g.id = game_id and g.maker_id = auth.uid()))
  with check (exists (select 1 from public.games g where g.id = game_id and g.maker_id = auth.uid()));

-- Sessions and teams hold no personal info, so anyone with the PIN may watch them.
create policy "anyone reads sessions" on public.sessions
  for select to anon, authenticated using (true);
create policy "makers manage own sessions" on public.sessions
  for all to authenticated
  using (maker_id = auth.uid())
  with check (maker_id = auth.uid() and exists (select 1 from public.games g where g.id = game_id and g.maker_id = auth.uid()));

create policy "anyone reads teams" on public.teams
  for select to anon, authenticated using (true);
create policy "makers manage own teams" on public.teams
  for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.maker_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.maker_id = auth.uid()));

-- Players, answers and buzzes: only the session's maker reads them directly.
create policy "makers read own players" on public.players
  for select to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.maker_id = auth.uid()));
create policy "makers remove own players" on public.players
  for delete to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.maker_id = auth.uid()));

create policy "makers read own answers" on public.answers
  for select to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.maker_id = auth.uid()));

create policy "makers read own buzzes" on public.buzz_order
  for select to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.maker_id = auth.uid()));

create policy "makers manage own awards" on public.awards
  for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.maker_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.maker_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- Realtime: phones and the projector follow these tables live.
-- ─────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.sessions, public.teams;

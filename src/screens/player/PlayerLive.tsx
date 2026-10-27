"use client";

import { use, useEffect, useRef, useState } from "react";
import type { ClimberStyle } from "@/components/climbers/ClimberMarker";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { ANSWER_SLOTS } from "@/lib/answers";
import { teamOf, type SessionRow, type TeamAnswer, type TeamRow } from "@/lib/db";
import { afterFact, questionLabel, ranked, stageTeams } from "@/lib/stage";
import { getSupabase } from "@/lib/supabase";
import { TEAMS, teamsFor, type Team, type TeamId } from "@/lib/teams";
import { useSecondsLeft } from "@/lib/useCountdown";
import { useLiveSession } from "@/lib/useLiveSession";
import { SettingsProvider, type Settings } from "@/lib/useSettings";
import { useWakeLock } from "@/lib/useWakeLock";
import { PlayerAnswer, type AnswerResult } from "./PlayerAnswer";
import { PlayerBuzzer, type BuzzerStatus } from "./PlayerBuzzer";
import { PlayerJoin, type JoinDetails } from "./PlayerJoin";
import { PlayerLobby } from "./PlayerLobby";
import { PlayerPledge } from "./PlayerPledge";
import { PlayerStorm } from "./PlayerStorm";
import { PlayerSummit } from "./PlayerSummit";
import { PlayerSupplies } from "./PlayerSupplies";

/** What join_session / rejoin_session return (supabase/migrations/0002_join.sql). */
interface Me {
  token: string;
  session_id: string;
  pin: string;
  team_key: TeamId;
  nickname: string;
  climber_style: ClimberStyle;
}

// Only the reconnect token and PIN are kept on the phone; the server knows nickname + team.
const STORAGE_KEY = "chhito:player";

function readSaved(): { token: string; pin: string } | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}

function writeSaved(value: { token: string; pin: string } | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the player just won't auto-reconnect.
  }
}

/** The phone for a live game: join, then follow the session as the host moves it along. */
export function PlayerLive({ pin }: { pin?: Promise<string> }) {
  const urlPin = pin ? use(pin) : "";
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);

  // Reopening the link on the same phone rejoins the same team and climber.
  useEffect(() => {
    const rejoin = async () => {
      const sb = getSupabase();
      const saved = readSaved();
      if (sb && saved && (!urlPin || saved.pin === urlPin)) {
        const { data, error } = await sb.rpc("rejoin_session", { p_token: saved.token });
        if (data) setMe(data as Me);
        else if (!error) writeSaved(null); // game over; keep the token if it was only a network blip
      }
      setChecking(false);
    };
    rejoin();
  }, [urlPin]);

  if (!getSupabase())
    return (
      <PhoneShell>
        <p className="text-lg font-bold">This game isn&apos;t connected yet. Ask the host to check the setup.</p>
      </PhoneShell>
    );
  if (checking)
    return (
      <PhoneShell className="items-center justify-center">
        <p className="text-lg font-bold text-body" role="status">
          Finding your climb…
        </p>
      </PhoneShell>
    );

  const leave = () => {
    writeSaved(null);
    setMe(null);
  };

  return (
    <PhoneShell>
      {me ? (
        <Joined me={me} onLeave={leave} />
      ) : (
        <JoinStep
          initialPin={urlPin}
          onJoined={(joined) => {
            writeSaved({ token: joined.token, pin: joined.pin });
            setMe(joined);
          }}
        />
      )}
    </PhoneShell>
  );
}

/** Teams in the open game with this PIN, or null if no game is open with it. */
async function findTeams(pin: string): Promise<Team[] | null> {
  const sb = getSupabase()!;
  const { data: session } = await sb.from("sessions").select("id").eq("pin", pin).neq("state", "ENDED").maybeSingle();
  if (!session) return null;
  const { data } = await sb.from("teams").select("team_key, name").eq("session_id", session.id).order("position");
  return ((data ?? []) as Pick<TeamRow, "team_key" | "name">[]).map(teamOf);
}

function JoinStep({ initialPin, onJoined }: { initialPin: string; onJoined: (me: Me) => void }) {
  const [teams, setTeams] = useState<Team[]>(teamsFor(5));
  const [pinNote, setPinNote] = useState<string | undefined>();
  const lookupId = useRef(0);

  /** Looks up the teams playing in the game with this 6-digit PIN, then shows them (latest lookup wins). */
  function lookup(digits: string) {
    const id = ++lookupId.current;
    findTeams(digits).then((found) => {
      if (id !== lookupId.current) return;
      setPinNote(found ? undefined : "No game with that PIN is open. Check the big screen.");
      if (found?.length) setTeams(found);
    });
  }

  // From the QR code the PIN is already filled in, so look it up straight away.
  useEffect(() => {
    const digits = initialPin.replace(/\D/g, "");
    if (digits.length === 6) lookup(digits);
  }, [initialPin]);

  function pinChanged(digits: string) {
    if (digits.length === 6) return lookup(digits);
    lookupId.current++; // drop any lookup still on its way back
    setPinNote(undefined);
  }

  async function join({ pin, nickname, team, style }: JoinDetails) {
    const { data, error } = await getSupabase()!.rpc("join_session", {
      p_pin: pin,
      p_nickname: nickname,
      p_team_key: team.id,
      p_style: style,
    });
    if (error) return error.message;
    onJoined(data as Me);
  }

  return <PlayerJoin initialPin={initialPin} teams={teams} pinNote={pinNote} onPinChange={pinChanged} onJoin={join} />;
}

function Joined({ me, onLeave }: { me: Me; onLeave: () => void }) {
  const { session, teams } = useLiveSession(me.session_id);
  const row = teams.find((t) => t.team_key === me.team_key);
  const team = row ? teamOf(row) : TEAMS[me.team_key];
  const state = session?.state;
  // Keep the phone awake for the whole climb so it doesn't miss a question.
  useWakeLock(state !== undefined && state !== "ENDED");

  let screen: React.ReactNode;
  if (state === "ENDED")
    screen = (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-[34px] font-extrabold leading-tight">This game has ended</h1>
        <p className="text-lg text-body">Thanks for climbing with us!</p>
        <button type="button" onClick={onLeave} className="min-h-[52px] cursor-pointer rounded-2xl border-[3px] border-ink bg-white px-6 text-lg font-extrabold">
          Join another game
        </button>
      </div>
    );
  else if (state === "SUPPLY_SHOP" && row) screen = <LiveSupplies me={me} row={row} team={team} />;
  else if (state === "STORM_EVENT" && session?.public_card)
    screen = <LiveStorm key={session.public_card.id} session={session} supplies={row?.supplies ?? []} />;
  else if (session && (state === "QUESTION" || state === "REVEAL") && session.public_question)
    screen = <LiveQuestion key={session.public_question.id} me={me} session={session} teams={teams} />;
  else if (state === "RESULTS") screen = <LiveSummit me={me} team={team} teams={teams} />;
  else if (state === "VOTING_PLAN")
    screen = <PlayerPledge onPlanMade={() => void getSupabase()!.rpc("record_voting_plan", { p_token: me.token }).then()} />;
  else screen = <PlayerLobby nickname={me.nickname} team={team} style={me.climber_style} />;

  return <SettingsProvider value={session?.settings as Partial<Settings> | undefined}>{screen}</SettingsProvider>;
}

function LiveSupplies({ me, row, team }: { me: Me; row: TeamRow; team: Team }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(fn: "toggle_supply" | "lock_supplies", args: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const { error } = await getSupabase()!.rpc(fn, { p_token: me.token, ...args });
    if (error) setError(error.message);
    setBusy(false);
  }

  // The pack itself comes from the team row, so every teammate's phone shows the same list.
  return (
    <PlayerSupplies
      team={team}
      picked={row.supplies}
      locked={row.supplies_locked}
      onToggle={(id) => call("toggle_supply", { p_item: id })}
      onLock={(locked) => call("lock_supplies", { p_locked: locked })}
      error={error}
      busy={busy}
    />
  );
}

function LiveStorm({ session, supplies }: { session: SessionRow; supplies: TeamRow["supplies"] }) {
  const card = session.public_card!;
  const secondsLeft = useSecondsLeft(session.phase_started_at, card.seconds);
  return <PlayerStorm card={card} supplies={supplies} secondsLeft={secondsLeft} />;
}

function LiveQuestion({ me, session, teams }: { me: Me; session: SessionRow; teams: TeamRow[] }) {
  const q = session.public_question!;
  const [answer, setAnswer] = useState<TeamAnswer | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buzzerMode = q.mode === "buzzer" && q.options.length > 0;
  // Buttons mode times the whole question; Buzzer mode times each team's turn.
  const secondsLeft = useSecondsLeft(session.state === "QUESTION" ? (buzzerMode ? q.turn_started_at : session.phase_started_at) : null, q.timer_seconds);
  const teamAnswered = teams.some((t) => t.team_key === me.team_key && t.answered_question_id === q.id);
  const checkpoint = stageTeams(teams, session).find((t) => t.team.id === me.team_key)?.checkpoint ?? 0;

  // A teammate may lock the answer first (or this phone reconnected): fetch what the team chose.
  useEffect(() => {
    if (!teamAnswered) return;
    getSupabase()!
      .rpc("my_team_answer", { p_token: me.token })
      .then(({ data }) => data && setAnswer(data as TeamAnswer));
  }, [teamAnswered, me.token]);

  async function pick(index: number) {
    setSending(true);
    setError(null);
    const { data, error } = await getSupabase()!.rpc("submit_answer", { p_token: me.token, p_option: index });
    setSending(false);
    if (error) setError(error.message);
    else setAnswer(data as TeamAnswer);
  }

  async function buzz() {
    setSending(true);
    setError(null);
    const { error } = await getSupabase()!.rpc("buzz_in", { p_token: me.token });
    setSending(false);
    if (error) setError(error.message);
  }

  if (session.state === "QUESTION" && buzzerMode) {
    const place = q.buzz.indexOf(me.team_key) + 1;
    const nameOf = (key: string) => teams.find((t) => t.team_key === key)?.name ?? null;
    const status: BuzzerStatus =
      q.turn_team === me.team_key
        ? { kind: "turn", secondsLeft, locked: answer ? { index: answer.option_index, by: answer.mine ? null : answer.answered_by } : null }
        : q.missed.includes(me.team_key)
          ? { kind: "missed" }
          : place > 0
            ? { kind: "queued", place, answering: q.turn_team ? nameOf(q.turn_team) : null }
            : { kind: "puzzle" };
    return (
      <PlayerBuzzer
        label={`BUZZER MODE · Q ${q.number}`}
        prompt={q.prompt}
        options={q.options}
        status={status}
        onBuzz={buzz}
        onPick={pick}
        busy={sending}
        error={error}
      />
    );
  }

  let result: AnswerResult | undefined;
  if (session.state === "REVEAL") {
    const fact = afterFact(q);
    const gained = q.gained?.[me.team_key] ?? 0;
    const prep = q.prep?.[me.team_key] ?? 0;
    const right = q.correct_index;
    if (q.options.length === 0 || right == null) {
      result = {
        correct: true,
        headline: gained > 0 ? `Summit push! +${gained} for your team` : "Nice teamwork!",
        subline: "Every team gets +10 for completing the Final Ascent. The host awards extra points for the best plans.",
        fact,
      };
    } else if (answer?.option_index === right) {
      const bonus = gained - 10 - prep;
      result = {
        correct: true,
        headline: `Correct! +${gained} for your team`,
        subline: `${bonus > 0 ? `+${bonus} speed bonus. ` : ""}${prep ? "+5 supply token for packing well! " : ""}Your team keeps climbing.`,
        fact,
      };
    } else {
      result = {
        correct: false,
        headline: answer ? "Not this time" : "No answer this time",
        subline: `No points lost, and your team keeps climbing. The answer was ${ANSWER_SLOTS[right].letter} · ${q.options[right]}.`,
        fact,
      };
    }
  }

  return (
    <PlayerAnswer
      label={questionLabel(q)}
      prompt={q.prompt}
      options={q.options}
      checkpoint={checkpoint}
      secondsLeft={secondsLeft}
      locked={answer ? { index: answer.option_index, by: answer.mine ? null : answer.answered_by } : null}
      onPick={session.state === "QUESTION" ? pick : undefined}
      sending={sending}
      error={error}
      result={result}
    />
  );
}

interface TeamStats {
  correct: number;
  questions: number;
  best_streak: number;
  plan_made: boolean;
}

function LiveSummit({ me, team, teams }: { me: Me; team: Team; teams: TeamRow[] }) {
  const [stats, setStats] = useState<TeamStats | null>(null);
  useEffect(() => {
    getSupabase()!
      .rpc("team_stats", { p_token: me.token })
      .then(({ data }) => setStats(data as TeamStats | null));
  }, [me.token]);

  const order = ranked(teams);
  const place = order.findIndex((t) => t.team_key === me.team_key) + 1;
  return (
    <PlayerSummit
      team={team}
      style={me.climber_style}
      place={Math.max(place, 1)}
      points={order[place - 1]?.points ?? 0}
      teamCorrect={stats?.correct ?? 0}
      questionCount={stats?.questions ?? 0}
      teamBestStreak={stats?.best_streak ?? 0}
      planMade={stats?.plan_made ?? false}
    />
  );
}

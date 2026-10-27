"use client";

import { use, useEffect, useRef, useState } from "react";
import type { ClimberStyle } from "@/components/climbers/ClimberMarker";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { teamOf, type TeamRow } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";
import { TEAMS, teamsFor, type Team, type TeamId } from "@/lib/teams";
import { useLiveSession } from "@/lib/useLiveSession";
import { PlayerJoin, type JoinDetails } from "./PlayerJoin";
import { PlayerLobby } from "./PlayerLobby";

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

function JoinStep({ initialPin, onJoined }: { initialPin: string; onJoined: (me: Me) => void }) {
  const [teams, setTeams] = useState<Team[]>(teamsFor(5));
  const [pinNote, setPinNote] = useState<string | undefined>();
  const lookupId = useRef(0);

  /** Shows the teams playing in the game with this PIN. */
  async function lookup(digits: string) {
    const id = ++lookupId.current;
    if (digits.length !== 6) return setPinNote(undefined);
    const sb = getSupabase()!;
    const { data: session } = await sb.from("sessions").select("id").eq("pin", digits).neq("state", "ENDED").maybeSingle();
    if (id !== lookupId.current) return;
    if (!session) return setPinNote("No game with that PIN is open. Check the big screen.");
    const { data } = await sb.from("teams").select("team_key, name").eq("session_id", session.id).order("position");
    if (id !== lookupId.current) return;
    setPinNote(undefined);
    if (data?.length) setTeams((data as Pick<TeamRow, "team_key" | "name">[]).map(teamOf));
  }

  // From the QR code the PIN is already filled in, so look it up straight away.
  useEffect(() => {
    if (initialPin) lookup(initialPin.replace(/\D/g, ""));
  }, [initialPin]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return <PlayerJoin initialPin={initialPin} teams={teams} pinNote={pinNote} onPinChange={lookup} onJoin={join} />;
}

function Joined({ me, onLeave }: { me: Me; onLeave: () => void }) {
  const { session, teams } = useLiveSession(me.session_id);
  const row = teams.find((t) => t.team_key === me.team_key);
  const team = row ? teamOf(row) : TEAMS[me.team_key];

  if (session?.state === "ENDED")
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-[34px] font-extrabold leading-tight">This game has ended</h1>
        <p className="text-lg text-body">Thanks for climbing with us!</p>
        <button type="button" onClick={onLeave} className="min-h-[52px] cursor-pointer rounded-2xl border-[3px] border-ink bg-white px-6 text-lg font-extrabold">
          Join another game
        </button>
      </div>
    );

  // Supply shop, questions and results follow the session state from milestone 5 on.
  return <PlayerLobby nickname={me.nickname} team={team} style={me.climber_style} />;
}

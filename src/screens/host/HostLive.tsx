"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { HostStage } from "@/components/layout/HostStage";
import { teamOf } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";
import { useLiveSession } from "@/lib/useLiveSession";
import type { Maker } from "@/lib/useMaker";
import { MakerGate, MakerMessage } from "@/screens/maker/MakerGate";
import { HostLobby } from "./HostLobby";

type Lookup = { id: string } | "missing" | "not-yours" | null;

/** The projector for a live session. Only the maker who opened it can run it. */
export function HostLive({ pin }: { pin: Promise<string> }) {
  const gamePin = use(pin);
  return <MakerGate>{(maker) => <Live pin={gamePin} maker={maker} />}</MakerGate>;
}

function Live({ pin, maker }: { pin: string; maker: Maker }) {
  const [lookup, setLookup] = useState<Lookup>(null);

  useEffect(() => {
    getSupabase()!
      .from("sessions")
      .select("id, maker_id")
      .eq("pin", pin)
      .neq("state", "ENDED")
      .maybeSingle()
      .then(({ data }) => setLookup(!data ? "missing" : data.maker_id !== maker.id ? "not-yours" : { id: data.id }));
  }, [pin, maker.id]);

  const { session, teams } = useLiveSession(typeof lookup === "object" && lookup ? lookup.id : null);

  if (lookup === "missing" || session?.state === "ENDED")
    return (
      <MakerMessage>
        <h1 className="text-2xl font-extrabold">No open game with PIN {pin}</h1>
        <p>It may have ended. Open Base Camp again from your game to get a new PIN.</p>
        <Link href="/maker" className="font-bold text-flag-blue">
          ← My games
        </Link>
      </MakerMessage>
    );
  if (lookup === "not-yours")
    return (
      <MakerMessage>
        <h1 className="text-2xl font-extrabold">This game is hosted from another account</h1>
        <p>Sign in as the maker who opened it to run the projector.</p>
      </MakerMessage>
    );
  if (!session) return <MakerMessage>Opening Base Camp…</MakerMessage>;

  const liveTeams = teams.map((t) => ({ team: teamOf(t), members: t.members }));

  return (
    <HostStage className="bg-page">
      {session.state === "LOBBY" && (
        <HostLobby
          pin={session.pin}
          teams={liveTeams}
          // The game state machine (supply shop, questions, reveal) is wired up in milestone 5.
          onStart={() => window.alert("Starting the climb arrives in the next milestone.")}
        />
      )}
    </HostStage>
  );
}

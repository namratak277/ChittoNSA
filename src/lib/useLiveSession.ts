"use client";

import { useEffect, useState } from "react";
import type { SessionRow, TeamRow } from "./db";
import { getSupabase } from "./supabase";

/**
 * A live session and its teams, kept up to date over Supabase Realtime.
 * Used by both the projector and the phones, so every screen switches at the same moment.
 */
export function useLiveSession(sessionId: string | null) {
  const [session, setSession] = useState<SessionRow | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !sessionId) return;
    let active = true;

    // Load after subscribing (and again after a reconnect), so no change is missed in between.
    const load = async () => {
      const [s, t] = await Promise.all([
        sb.from("sessions").select("*").eq("id", sessionId).single(),
        sb.from("teams").select("*").eq("session_id", sessionId).order("position"),
      ]);
      if (!active) return;
      if (s.data) setSession(s.data as SessionRow);
      if (t.data) setTeams(t.data as TeamRow[]);
    };

    const channel = sb
      .channel(`session:${sessionId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` }, (change) =>
        setSession(change.new as SessionRow),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "teams", filter: `session_id=eq.${sessionId}` }, (change) => {
        const row = change.new as TeamRow;
        if (!row?.id) return;
        setTeams((ts) => (ts.some((t) => t.id === row.id) ? ts.map((t) => (t.id === row.id ? row : t)) : [...ts, row].sort((a, b) => a.position - b.position)));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") load();
      });

    return () => {
      active = false;
      sb.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, teams };
}

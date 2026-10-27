"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";

/** Postgres gives microseconds; trim to milliseconds so every browser parses it. */
const parseTime = (iso: string) => new Date(iso.replace(/(\.\d{3})\d+/, "$1")).getTime();

// Phone clocks can be off by seconds, so measure the gap to the server clock once per page load.
let offset: Promise<number> | null = null;

function serverOffset() {
  offset ??= (async () => {
    const sb = getSupabase();
    if (!sb) return 0;
    const sent = Date.now();
    const { data } = await sb.rpc("server_now");
    const received = Date.now();
    return typeof data === "string" ? parseTime(data) - (sent + received) / 2 : 0;
  })();
  return offset;
}

/** Whole seconds left on a server-started timer, or null when no timer is running. */
export function useSecondsLeft(startedAt: string | null | undefined, seconds: number | null | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());
  const [skew, setSkew] = useState(0);

  useEffect(() => {
    serverOffset().then(setSkew);
  }, []);

  useEffect(() => {
    if (!startedAt || !seconds) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt, seconds]);

  if (!startedAt || !seconds) return null;
  const end = parseTime(startedAt) + seconds * 1000;
  return Math.max(0, Math.ceil((end - (now + skew)) / 1000));
}

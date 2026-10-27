"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SETTINGS } from "./settings";
import { getSupabase } from "./supabase";

export interface Maker {
  id: string;
  name: string;
  club: string;
}

export type MakerState = { status: "unconfigured" } | { status: "loading" } | { status: "ready"; maker: Maker };

function toMaker(user: User): Maker {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    name: meta.name || meta.full_name || user.email?.split("@")[0] || "Maker",
    club: meta.club || SETTINGS.clubName,
  };
}

/** The signed-in game maker. Sends signed-out visitors to the sign-in page. */
export function useMaker(): MakerState {
  const router = useRouter();
  const [state, setState] = useState<MakerState>(() => (getSupabase() ? { status: "loading" } : { status: "unconfigured" }));

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const apply = (user: User | null) => {
      if (user) setState({ status: "ready", maker: toMaker(user) });
      else router.replace("/maker/sign-in");
    };
    sb.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));
    const { data } = sb.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [router]);

  return state;
}

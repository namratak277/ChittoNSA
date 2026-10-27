"use client";

import type { ReactNode } from "react";
import { useMaker, type Maker } from "@/lib/useMaker";

/** Renders maker screens only for a signed-in maker. */
export function MakerGate({ children }: { children: (maker: Maker) => ReactNode }) {
  const state = useMaker();
  if (state.status === "unconfigured") return <SupabaseMissing />;
  if (state.status === "loading") return <MakerMessage>Loading…</MakerMessage>;
  return children(state.maker);
}

export function MakerMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-maker p-8 text-ink">
      <div className="flex max-w-[520px] flex-col gap-3 rounded-2xl border-2 border-ink bg-white p-6 text-[17px] leading-snug">{children}</div>
    </div>
  );
}

export function SupabaseMissing() {
  return (
    <MakerMessage>
      <h1 className="text-2xl font-extrabold">Supabase isn&apos;t connected yet</h1>
      <p>
        Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, run the SQL in{" "}
        <code>supabase/migrations</code>, then restart the dev server.
      </p>
    </MakerMessage>
  );
}

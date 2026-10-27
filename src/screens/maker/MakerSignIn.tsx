"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GLACIER } from "@/lib/colors";
import { SETTINGS } from "@/lib/settings";
import { getSupabase } from "@/lib/supabase";
import { PRAYER_FLAG_ORDER } from "@/lib/teams";

const field = "h-12 w-full rounded-xl border-2 border-ink bg-white px-3.5 text-[17px]";
const NOT_CONNECTED = "Supabase isn't connected yet. Add the keys to .env.local and restart the dev server.";

/** Sign in / create account for game makers (design-reference/Maker-SignIn.dc.html). */
export function MakerSignIn() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  // Already signed in (or just back from Google): go straight to My games.
  useEffect(() => {
    getSupabase()
      ?.auth.getSession()
      .then(({ data }) => data.session && router.replace("/maker"));
  }, [router]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return setMessage({ error: true, text: NOT_CONNECTED });
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    setBusy(true);
    setMessage(null);
    if (creating) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { name: String(form.get("name") ?? "").trim(), club: String(form.get("club") ?? "").trim() },
          emailRedirectTo: `${location.origin}/maker`,
        },
      });
      if (error) setMessage({ error: true, text: error.message });
      else if (data.session) router.replace("/maker");
      else setMessage({ error: false, text: "Check your email to confirm your account, then sign in here." });
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setMessage({ error: true, text: error.message });
      else router.replace("/maker");
    }
    setBusy(false);
  }

  async function google() {
    const sb = getSupabase();
    if (!sb) return setMessage({ error: true, text: NOT_CONNECTED });
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/maker` } });
    if (error) setMessage({ error: true, text: error.message });
  }

  const tab = (on: boolean) =>
    `min-h-[46px] cursor-pointer border-0 text-[17px] ${on ? "bg-ink font-extrabold text-white" : "bg-white font-bold text-ink"}`;

  return (
    <div className="flex min-h-dvh flex-col bg-page text-ink lg:flex-row">
      <section className="relative flex flex-col gap-3.5 overflow-hidden bg-glacier-haze p-8 pb-[220px] lg:w-[560px] lg:shrink-0 lg:p-14">
        <div className="grid w-fit grid-cols-5 gap-1.5" aria-hidden>
          {PRAYER_FLAG_ORDER.map((c) => (
            <div key={c} className={`h-[34px] w-7 ${c === "#FFFFFF" ? "border-2 border-ink" : ""}`} style={{ background: c }} />
          ))}
        </div>
        <p className="text-xl font-bold text-flag-red">Chhito! · for game makers</p>
        <h1 className="text-[52px] font-extrabold leading-[1.02]">Build the climb. Host the night.</h1>
        <p className="max-w-[420px] text-[19px] leading-snug text-[#2F3A5A]">
          Make quiz games about Nepal and voting, save them, and host them on a projector. Your account keeps your games.
        </p>
        <svg viewBox="0 0 560 260" preserveAspectRatio="xMidYMax slice" aria-hidden className="absolute bottom-0 left-0 h-[200px] w-full lg:h-[260px]">
          <path d="M0 260 L120 170 L200 120 L260 70 L300 30 L340 72 L400 120 L480 180 L560 230 L560 260 Z" fill={GLACIER.lit} />
          <path d="M300 30 L340 72 L400 120 L480 180 L560 230 L560 260 L400 260 L370 180 L330 90 Z" fill={GLACIER.shadow} />
          <path d="M282 52 L300 30 L318 56 L308 52 L300 64 L292 52 Z" fill="#fff" />
          <path d="M0 260 L0 236 Q140 214 280 240 Q420 214 560 236 L560 260 Z" fill={GLACIER.foothill} />
        </svg>
      </section>

      <section className="flex grow items-center justify-center p-10">
        <form className="flex w-full max-w-[440px] flex-col gap-4" onSubmit={submit}>
          <div className="grid grid-cols-2 overflow-hidden rounded-[14px] border-2 border-ink" role="tablist">
            <button type="button" role="tab" aria-selected={!creating} onClick={() => setCreating(false)} className={tab(!creating)}>
              Sign in
            </button>
            <button type="button" role="tab" aria-selected={creating} onClick={() => setCreating(true)} className={tab(creating)}>
              Create account
            </button>
          </div>
          {creating && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mname" className="text-[15px] font-bold">
                  Your name
                </label>
                <input id="mname" name="name" required autoComplete="name" placeholder="Maya" className={field} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mclub" className="text-[15px] font-bold">
                  Club or organization
                </label>
                <input id="mclub" name="club" autoComplete="organization" placeholder={SETTINGS.clubName} className={field} />
              </div>
            </>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="memail" className="text-[15px] font-bold">
              Email
            </label>
            <input id="memail" name="email" type="email" required autoComplete="email" placeholder="you@school.edu" className={field} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mpass" className="text-[15px] font-bold">
              Password
            </label>
            <input
              id="mpass"
              name="password"
              type="password"
              required
              minLength={creating ? 8 : undefined}
              autoComplete={creating ? "new-password" : "current-password"}
              className={field}
            />
          </div>
          {message && (
            <p role={message.error ? "alert" : "status"} className={`text-base font-bold ${message.error ? "text-flag-red" : "text-pine"}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex min-h-[52px] cursor-pointer items-center justify-center rounded-[14px] border-0 bg-ink text-[19px] font-extrabold text-white disabled:opacity-60"
          >
            {busy ? "One moment…" : creating ? "Create account" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={google}
            className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border-2 border-ink bg-white text-[17px] font-bold text-ink"
          >
            Continue with Google
          </button>
          <p className="border-t-2 border-dashed border-[#C9C4D6] pt-3.5 text-base leading-snug text-body">
            Here to play? You don&apos;t need an account. Go to <b>{SETTINGS.gameUrl}</b> and enter the game PIN.
          </p>
        </form>
      </section>
    </div>
  );
}

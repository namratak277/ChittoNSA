"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { SETTINGS } from "@/lib/settings";
import { teamsFor, type TeamCount } from "@/lib/teams";
import { filledSettings, SETTING_FIELDS, type Settings } from "@/lib/useSettings";
import type { Maker } from "@/lib/useMaker";
import { MakerGate } from "./MakerGate";
import { MakerTopBarShell } from "./MakerShell";

type Mode = "buttons" | "buzzer";

const MODES = [
  {
    id: "buttons" as const,
    tag: "MODE 1",
    tagColor: "text-flag-blue",
    name: "Buttons mode",
    body: "Everyone answers every question. Faster right answers earn more bonus points.",
    best: "Best for big groups",
  },
  {
    id: "buzzer" as const,
    tag: "MODE 2",
    tagColor: "text-flag-red",
    name: "Buzzer mode",
    body: "Solve the flag puzzle to buzz in. First to finish answers first; if they miss, the next buzzer tries.",
    best: "Best for finals and small groups",
  },
];

const select = "h-[46px] rounded-[10px] border-2 border-ink bg-white px-2.5 text-base";

/** Host setup: mode, timer, teams → Open Base Camp (design-reference/Maker-Host.dc.html). */
export function MakerHostSetup({ gameId }: { gameId: Promise<string> }) {
  const id = use(gameId);
  return <MakerGate>{(maker) => <HostSetup id={id} maker={maker} />}</MakerGate>;
}

// Buttons mode: 0 means each question uses the timer set in the builder.
const DEFAULT_TIMER: Record<Mode, number> = { buttons: 0, buzzer: 10 };

// The host's filled-in placeholders, remembered on this laptop for the next game night.
const SETTINGS_KEY = "chhito:host-settings";

function readSavedSettings(): Partial<Settings> {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Random 6-digit PIN that never starts with 0, so it reads well on the projector. */
function makePin() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 900000;
  return String(100000 + n);
}

function HostSetup({ id, maker }: { id: string; maker: Maker }) {
  const router = useRouter();
  const [title, setTitle] = useState("…");
  const [found, setFound] = useState(true);
  const [mode, setModeState] = useState<Mode>("buttons");
  const [timer, setTimer] = useState(DEFAULT_TIMER.buttons);
  const [teams, setTeams] = useState("5");
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only rendered in the browser (after sign-in), so reading this laptop's saved values here is safe.
  const [settings, setSettings] = useState<Partial<Settings>>(readSavedSettings);
  const buttons = mode === "buttons";
  const modeName = buttons ? "Buttons mode" : "Buzzer mode";

  const setMode = (m: Mode) => {
    setModeState(m);
    setTimer(DEFAULT_TIMER[m]);
  };

  useEffect(() => {
    getSupabase()!
      .from("games")
      .select("title, default_mode")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setFound(false);
          setTitle("Game not found");
          return;
        }
        setTitle(data.title);
        setModeState(data.default_mode);
        setTimer(DEFAULT_TIMER[data.default_mode as Mode]);
      });
  }, [id]);

  /** Makes the live session with a fresh PIN and its teams, then opens the projector. */
  async function openBaseCamp() {
    const sb = getSupabase()!;
    setOpening(true);
    setError(null);
    // One live game per maker: close any earlier session that was left open.
    await sb.from("sessions").update({ state: "ENDED" }).eq("maker_id", maker.id).neq("state", "ENDED");
    const teamCount = Number(teams) as TeamCount;
    const filled = filledSettings(settings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(filled));
    } catch {
      // Storage blocked: the values still go with this session.
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await sb
        .from("sessions")
        .insert({ game_id: id, pin: makePin(), mode, timer_seconds: timer, team_count: teamCount, settings: filled })
        .select("id, pin")
        .single();
      if (error?.code === "23505") continue; // PIN already live, try another
      if (error) break;
      const rows = teamsFor(teamCount).map((t, i) => ({
        session_id: data.id,
        team_key: t.id,
        name: t.id === "orange" && filled.team6Name ? filled.team6Name : t.name,
        position: i,
      }));
      const t = await sb.from("teams").insert(rows);
      if (t.error) {
        setError(t.error.message);
        setOpening(false);
        return;
      }
      router.push(`/host/${data.pin}`);
      return;
    }
    setError("Couldn't open Base Camp. Check your connection and try again.");
    setOpening(false);
  }

  return (
    <MakerTopBarShell title={`Host: ${title}`} actions={<span className="text-[15px] text-[#B9B5C9]">Signed in as {maker.name}</span>}>
      <div className="flex grow flex-col gap-7 px-8 py-7 lg:flex-row">
        <div className="flex min-w-0 grow flex-col gap-4">
          <h2 className="text-[32px] font-extrabold leading-tight">How should people play tonight?</h2>
          <div className="grid gap-[18px] sm:grid-cols-2">
            {MODES.map((m) => {
              const on = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMode(m.id)}
                  className={`flex min-h-[180px] cursor-pointer flex-col gap-1.5 rounded-[18px] px-[22px] py-5 text-left text-ink ${
                    on ? "border-4 border-ink bg-white shadow-[6px_6px_0_#1E1B2E]" : "border-2 border-quiet bg-[#FBFAF6]"
                  }`}
                >
                  <span className={`text-sm font-extrabold tracking-[1px] ${m.tagColor}`}>{m.tag}</span>
                  <span className="text-[28px] font-extrabold leading-tight">{m.name}</span>
                  <span className="text-[17px] font-medium leading-snug">{m.body}</span>
                  <span className="text-[15px] font-medium text-body">{m.best}</span>
                </button>
              );
            })}
          </div>
          <div className="grid gap-[18px] rounded-2xl border-2 border-ink bg-white px-[22px] py-[18px] md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="htimer" className="text-sm font-extrabold">
                {buttons ? "Answer timer" : "Time to answer after buzzing"}
              </label>
              <select id="htimer" value={timer} onChange={(e) => setTimer(Number(e.target.value))} className={select}>
                {(buttons ? [0, 10, 20, 30] : [5, 10, 15]).map((s) => (
                  <option key={s} value={s}>
                    {s === 0 ? "Each question's own timer" : buttons ? `${s} seconds for every question` : `${s} seconds each`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="hteams" className="text-sm font-extrabold">
                Teams
              </label>
              <select id="hteams" value={teams} onChange={(e) => setTeams(e.target.value)} className={select}>
                <option value="4">4 teams</option>
                <option value="5">5 teams</option>
                <option value="6">6 teams</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="hjoin" className="text-sm font-extrabold">
                Who can join
              </label>
              <select id="hjoin" className={select}>
                <option>Anyone with the PIN</option>
              </select>
            </div>
          </div>
          <fieldset className="grid gap-x-[18px] gap-y-3 rounded-2xl border-2 border-ink bg-white px-[22px] py-[18px] md:grid-cols-2">
            <legend className="px-1 text-lg font-extrabold">Fill in for tonight</legend>
            <p className="text-[15px] text-body md:col-span-2">
              Shown on the projector and phones. Leave a box empty to show the placeholder. Take dates and deadlines from ncsbe.gov only.
            </p>
            {SETTING_FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label htmlFor={`set-${f.key}`} className="text-sm font-extrabold">
                  {f.label}
                </label>
                <input
                  id={`set-${f.key}`}
                  value={settings[f.key] ?? ""}
                  placeholder={SETTINGS[f.key]}
                  aria-describedby={`set-${f.key}-hint`}
                  onChange={(e) => setSettings((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="h-[46px] rounded-[10px] border-2 border-ink bg-white px-3 text-base"
                />
                <span id={`set-${f.key}-hint`} className="text-[13px] text-body">
                  {f.hint}
                </span>
              </div>
            ))}
          </fieldset>
        </div>

        <aside className="flex shrink-0 flex-col gap-3 rounded-[20px] border-[3px] border-ink bg-white p-[22px] lg:w-[340px] lg:self-start">
          <h2 className="text-xl font-extrabold">Ready to open Base Camp</h2>
          <p className="text-base leading-normal">
            5 checkpoints · {modeName} · {teams} teams
            <br />
            Projector: this laptop
            <br />
            Players: phones, no account
          </p>
          <div className="rounded-[14px] bg-maker p-3.5 text-center">
            <p className="text-sm text-body">Game PIN</p>
            <p className="text-[22px] font-extrabold leading-tight">Made when you open</p>
          </div>
          {error && (
            <p role="alert" className="text-base font-bold text-flag-red">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={openBaseCamp}
            disabled={opening || !found}
            className="flex min-h-14 cursor-pointer items-center justify-center rounded-[14px] border-0 bg-flag-red text-xl font-extrabold text-white disabled:cursor-default disabled:opacity-60"
          >
            {opening ? "Opening…" : "Open Base Camp"}
          </button>
          <p className="text-sm leading-snug text-body">Opening a new game closes any game you left open before.</p>
          <p className="text-sm leading-snug text-body">
            Host controls: Start · Reveal · Next checkpoint · Storm card · Award points · Voting plan · End
          </p>
        </aside>
      </div>
    </MakerTopBarShell>
  );
}

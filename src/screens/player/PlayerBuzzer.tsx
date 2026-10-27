"use client";

import { useState } from "react";
import { SignpostPost } from "@/components/answers/SignpostPost";
import { ANSWER_SLOTS } from "@/lib/answers";
import { FLAG, INK } from "@/lib/colors";
import { Eyebrow } from "./parts";

// Traditional order: sky, air, fire, water, earth.
const ORDER = [
  { name: "Blue", meaning: "Sky", bg: FLAG.blue, fg: "#FFFFFF" },
  { name: "White", meaning: "Air", bg: "#FFFFFF", fg: INK },
  { name: "Red", meaning: "Fire", bg: FLAG.red, fg: "#FFFFFF" },
  { name: "Green", meaning: "Water", bg: FLAG.greenDark, fg: "#FFFFFF" },
  { name: "Yellow", meaning: "Earth", bg: FLAG.yellow, fg: INK },
];
const SHUFFLED = [4, 2, 0, 1, 3];
const FRINGE = "polygon(0 0, 100% 0, 100% 86%, 75% 100%, 50% 86%, 25% 100%, 0 86%)";

const ordinal = (n: number) => `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n] ?? "th"}`;

export type BuzzerStatus =
  | { kind: "puzzle" }
  /** Buzzed in; `answering` is the team whose turn it is now (null if none yet). */
  | { kind: "queued"; place: number; answering: string | null }
  | { kind: "turn"; secondsLeft: number | null; locked: { index: number; by?: string | null } | null }
  | { kind: "missed" };

interface PlayerBuzzerProps {
  label: string;
  prompt: string;
  options: string[];
  status: BuzzerStatus;
  /** Called once when this phone finishes the flag puzzle. */
  onBuzz: () => void;
  onPick: (index: number) => void;
  busy?: boolean;
  error?: string | null;
  /** Extra controls under the screen (the demo uses this). */
  children?: React.ReactNode;
}

/** Buzzer mode: flag puzzle → buzz order → answer (design-reference/Phone-Buzzer.dc.html). */
export function PlayerBuzzer({ label, prompt, options, status, onBuzz, onPick, busy = false, error, children }: PlayerBuzzerProps) {
  const [placed, setPlaced] = useState(0);
  const [msg, setMsg] = useState("");

  function tap(idx: number) {
    if (idx < placed) return;
    if (idx !== placed) {
      setMsg(placed === 0 ? "Not that one. Begin with the sky." : `Not that one. What comes after ${ORDER[placed - 1].meaning.toLowerCase()}?`);
      return;
    }
    setMsg("");
    setPlaced(placed + 1);
    if (placed + 1 === ORDER.length) {
      navigator.vibrate?.(80);
      onBuzz();
    }
  }

  return (
    <>
      <div>
        <Eyebrow>{label}</Eyebrow>
        <h1 className="text-[22px] font-extrabold leading-[1.15]">{prompt}</h1>
      </div>

      {status.kind === "puzzle" && (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1 rounded-2xl border-[3px] border-ink bg-white p-3.5">
            <p className="text-xl font-extrabold leading-[1.1]">Buzz in: hang the prayer flags in order</p>
            <p className="text-[15px] leading-snug text-body">Sky → air → fire → water → earth. Finish first to answer first.</p>
          </div>
          <div className="relative pt-2" aria-label={`${placed} of 5 flags hung`} role="img">
            <svg viewBox="0 0 350 20" preserveAspectRatio="none" aria-hidden className="absolute left-0 top-0 h-5 w-full">
              <path d="M2 4 Q175 20 348 4" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="grid grid-cols-5 gap-2 px-1.5">
              {ORDER.map((o, i) => (
                <div
                  key={o.name}
                  className="h-14"
                  style={{
                    clipPath: FRINGE,
                    ...(i < placed
                      ? { background: o.bg, boxShadow: `inset 0 0 0 2px ${INK}` }
                      : { background: "repeating-linear-gradient(45deg, #EEECF4 0 6px, #FFFDF8 6px 12px)", boxShadow: "inset 0 0 0 2px #A9A5B8" }),
                  }}
                />
              ))}
            </div>
          </div>
          <p role="alert" className="min-h-[22px] text-[15px] font-bold text-danger">
            {msg || error}
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {SHUFFLED.map((idx) => {
              const o = ORDER[idx];
              const done = idx < placed;
              return (
                <button
                  key={o.name}
                  type="button"
                  disabled={busy}
                  onClick={() => tap(idx)}
                  aria-label={`${o.name} flag, ${o.meaning}${done ? ", hung" : ""}`}
                  className={`min-h-16 cursor-pointer rounded-xl border-[3px] border-ink text-[19px] font-extrabold ${done ? "opacity-25" : ""}`}
                  style={{ background: o.bg, color: o.fg }}
                >
                  {o.meaning}
                </button>
              );
            })}
          </div>
          {placed === ORDER.length && (
            // Puzzle done but the buzz didn't arrive yet (or failed): let the team send it again.
            <button
              type="button"
              onClick={onBuzz}
              disabled={busy}
              className="min-h-12 cursor-pointer rounded-[14px] border-0 bg-flag-red text-lg font-extrabold text-white disabled:opacity-60"
            >
              {busy ? "Buzzing…" : "Buzz in"}
            </button>
          )}
        </div>
      )}

      {status.kind === "queued" && (
        <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3.5 text-center">
          <div className="flex size-[120px] items-center justify-center rounded-full border-4 border-ink bg-marigold text-[56px] font-extrabold">
            {ordinal(status.place)}
          </div>
          <p className="text-[32px] font-extrabold leading-[1.05]">Your team buzzed in {ordinal(status.place)}!</p>
          <p className="max-w-[290px] text-lg text-body">
            {status.answering
              ? `${status.answering} are answering. If they miss, the next team gets a turn — get ready.`
              : "Get ready for your turn."}
          </p>
        </div>
      )}

      {status.kind === "turn" && (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between rounded-[14px] bg-ink px-3.5 py-2.5 text-white" role="status">
            <span className="text-xl font-extrabold">Your team&apos;s turn!</span>
            {status.secondsLeft !== null && <span className="text-lg font-extrabold">{status.secondsLeft} sec</span>}
          </div>
          {status.locked ? (
            <div role="status" className="flex flex-col gap-1 rounded-[18px] border-[3px] border-ink bg-white p-5">
              <p className="text-sm font-bold tracking-[1px] text-body">LOCKED IN FOR YOUR TEAM</p>
              <p className="text-[28px] font-extrabold leading-tight">
                <span lang="ne">{ANSWER_SLOTS[status.locked.index].letter}</span> · {options[status.locked.index]}
              </p>
              {status.locked.by && <p className="text-base text-body">Chosen by {status.locked.by}.</p>}
              <p className="text-base text-body">Watch the big screen.</p>
            </div>
          ) : status.secondsLeft === 0 ? (
            <p className="text-xl font-extrabold">Time&apos;s up! No points lost.</p>
          ) : (
            <SignpostPost compact options={options} onSelect={onPick} disabled={busy} />
          )}
          {error && (
            <p role="alert" className="text-[15px] font-bold text-danger">
              {error}
            </p>
          )}
        </div>
      )}

      {status.kind === "missed" && (
        <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-[32px] font-extrabold leading-[1.05]">Not this time</p>
          <p className="max-w-[290px] text-lg text-body">No points lost, and your team keeps climbing. Watch who answers next!</p>
        </div>
      )}
      {children}
    </>
  );
}

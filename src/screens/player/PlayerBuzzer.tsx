"use client";

import { useState } from "react";
import { SignpostPost } from "@/components/answers/SignpostPost";
import { FLAG, INK } from "@/lib/colors";
import type { DemoQuestion } from "@/lib/demo";
import { Eyebrow, ResultCard } from "./parts";

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

type Stage = "puzzle" | "queued" | "turn" | "result";

interface PlayerBuzzerProps {
  question: DemoQuestion;
  questionNumber: number;
  /** The team answering before this one. */
  aheadTeamName: string;
}

/** Buzzer mode: flag puzzle → buzz order → answer (design-reference/Phone-Buzzer.dc.html). */
export function PlayerBuzzer({ question, questionNumber, aheadTeamName }: PlayerBuzzerProps) {
  const [stage, setStage] = useState<Stage>("puzzle");
  const [placed, setPlaced] = useState(0);
  const [msg, setMsg] = useState("");
  const [right, setRight] = useState(false);

  function tap(idx: number) {
    if (idx < placed) return;
    if (idx !== placed) {
      setMsg(placed === 0 ? "Not that one. Begin with the sky." : `Not that one. What comes after ${ORDER[placed - 1].meaning.toLowerCase()}?`);
      return;
    }
    setMsg("");
    if (placed + 1 === ORDER.length) {
      navigator.vibrate?.(80);
      setStage("queued");
    }
    setPlaced(placed + 1);
  }

  function reset() {
    setStage("puzzle");
    setPlaced(0);
    setMsg("");
    setRight(false);
  }

  return (
    <>
      <div>
        <Eyebrow>BUZZER MODE · Q {questionNumber}</Eyebrow>
        <h1 className="text-[22px] font-extrabold leading-[1.15]">{question.prompt}</h1>
      </div>

      {stage === "puzzle" && (
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
            {msg}
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {SHUFFLED.map((idx) => {
              const o = ORDER[idx];
              const done = idx < placed;
              return (
                <button
                  key={o.name}
                  type="button"
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
        </div>
      )}

      {stage === "queued" && (
        <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3.5 text-center">
          <div className="flex size-[120px] items-center justify-center rounded-full border-4 border-ink bg-marigold text-[56px] font-extrabold">2nd</div>
          <p className="text-[32px] font-extrabold leading-[1.05]">Your team buzzed in 2nd!</p>
          <p className="max-w-[290px] text-lg text-body">
            {aheadTeamName} are answering. If they miss, it&apos;s your team&apos;s turn — get ready.
          </p>
          <button type="button" onClick={() => setStage("turn")} className="min-h-12 cursor-pointer rounded-[14px] border-2 border-ink bg-white px-5 text-base font-bold">
            Demo: they missed →
          </button>
        </div>
      )}

      {stage === "turn" && (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between rounded-[14px] bg-ink px-3.5 py-2.5 text-white">
            <span className="text-xl font-extrabold">Your team&apos;s turn!</span>
            <span className="text-lg font-extrabold">10 sec</span>
          </div>
          <SignpostPost
            compact
            options={question.options}
            onSelect={(i) => {
              setRight(i === question.correctIndex);
              setStage("result");
            }}
          />
        </div>
      )}

      {stage === "result" && (
        <div className="flex flex-1 flex-col gap-3.5">
          <ResultCard
            correct={right}
            headline={right ? "Correct! +10 for your team" : "Not this time"}
            subline={
              right
                ? "Your team climbs toward the summit."
                : `No points lost — the next team gets a turn. The answer was ${question.options[question.correctIndex]}.`
            }
          />
          <button type="button" onClick={reset} className="mt-auto min-h-12 cursor-pointer rounded-[14px] border-2 border-ink bg-white text-[17px] font-bold">
            Play the puzzle again (demo)
          </button>
        </div>
      )}
    </>
  );
}

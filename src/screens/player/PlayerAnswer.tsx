"use client";

import { useState } from "react";
import { SignpostPost } from "@/components/answers/SignpostPost";
import { ANSWER_SLOTS } from "@/lib/answers";
import type { DemoQuestion } from "@/lib/demo";
import { CampProgress, Eyebrow, ResultCard, TrailFact } from "./parts";

interface PlayerAnswerProps {
  label: string;
  question: DemoQuestion;
  checkpoint: number;
  onPlan: () => void;
}

/**
 * Buttons mode answer on the phone (design-reference/Ans-Sign-Phone.dc.html).
 * The first tap from a team locks the team's answer; the result shows after the host reveals.
 */
export function PlayerAnswer({ label, question, checkpoint, onPlan }: PlayerAnswerProps) {
  const [pick, setPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const right = pick === question.correctIndex;
  const answer = question.options[question.correctIndex];

  return (
    <>
      <CampProgress checkpoint={revealed && right ? checkpoint + 1 : checkpoint} />
      {!revealed ? (
        <div className="flex flex-1 flex-col gap-3.5">
          <div>
            <Eyebrow>{label}</Eyebrow>
            <h1 className="text-2xl font-extrabold leading-[1.15]">{question.prompt}</h1>
          </div>
          {pick === null ? (
            <>
              <p className="text-[15px] text-body">Choose your trail — same letter and colour as the flags on the big screen</p>
              <SignpostPost options={question.options} onSelect={setPick} />
            </>
          ) : (
            <>
              <div role="status" className="flex flex-col gap-1 rounded-[18px] border-[3px] border-ink bg-white p-5">
                <p className="text-sm font-bold tracking-[1px] text-body">LOCKED IN FOR YOUR TEAM</p>
                <p className="text-[28px] font-extrabold leading-tight">
                  <span lang="ne">{ANSWER_SLOTS[pick].letter}</span> · {question.options[pick]}
                </p>
                <p className="text-base text-body">Watch the big screen for the answer.</p>
              </div>
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-auto min-h-12 cursor-pointer rounded-[14px] border-2 border-ink bg-white text-[17px] font-bold"
              >
                Demo: host reveals the answer →
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3.5">
          <ResultCard
            correct={right}
            headline={right ? "Correct! +10 for your team" : "Not this time"}
            subline={
              right
                ? "+3 speed bonus. Your team climbs toward the Final Ascent."
                : `No points lost, and your team keeps climbing. The answer was ${answer}.`
            }
          />
          <TrailFact>{question.trailFact}</TrailFact>
          <button
            type="button"
            onClick={() => {
              setPick(null);
              setRevealed(false);
            }}
            className="mt-auto min-h-12 cursor-pointer rounded-[14px] border-2 border-ink bg-white text-[17px] font-bold"
          >
            Try again (demo)
          </button>
          <button type="button" onClick={onPlan} className="cursor-pointer border-0 bg-transparent text-[15px] text-flag-blue underline">
            Demo: jump to my voting plan →
          </button>
        </div>
      )}
    </>
  );
}

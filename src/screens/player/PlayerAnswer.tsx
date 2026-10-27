"use client";

import { SignpostPost } from "@/components/answers/SignpostPost";
import { ANSWER_SLOTS } from "@/lib/answers";
import { CampProgress, Eyebrow, ResultCard, TrailFact } from "./parts";

export interface AnswerResult {
  correct: boolean;
  headline: string;
  subline: string;
  fact: { title: string; text: string } | null;
}

interface PlayerAnswerProps {
  label: string;
  prompt: string;
  /** Empty for a talk-it-through question (final scenario). */
  options: string[];
  /** Team's place on the Base → Summit bar (0–4). */
  checkpoint: number;
  secondsLeft?: number | null;
  /** The team's locked answer, and who tapped it if it wasn't this phone. */
  locked: { index: number; by?: string | null } | null;
  onPick?: (index: number) => void;
  /** True while this phone's tap is being sent. */
  sending?: boolean;
  error?: string | null;
  /** Set after the host reveals. */
  result?: AnswerResult;
  /** Extra controls under the screen (the demo uses this). */
  children?: React.ReactNode;
}

/**
 * Buttons mode answer on the phone (design-reference/Ans-Sign-Phone.dc.html).
 * The first tap from a team locks the team's answer; the result shows after the host reveals.
 */
export function PlayerAnswer({ label, prompt, options, checkpoint, secondsLeft, locked, onPick, sending, error, result, children }: PlayerAnswerProps) {
  const timeUp = secondsLeft === 0;
  const talkItThrough = options.length === 0;

  return (
    <>
      <CampProgress checkpoint={checkpoint} />
      {!result ? (
        <div className="flex flex-1 flex-col gap-3.5">
          <div>
            <Eyebrow>
              {label}
              {secondsLeft != null && secondsLeft > 0 && <span className="text-ink"> · {secondsLeft}s</span>}
            </Eyebrow>
            <h1 className="text-2xl font-extrabold leading-[1.15]">{prompt}</h1>
          </div>
          {talkItThrough ? (
            <div role="status" className="flex flex-col gap-1 rounded-[18px] border-[3px] border-ink bg-white p-5">
              <p className="text-[24px] font-extrabold leading-tight">Talk it through with your team</p>
              <p className="text-base text-body">Agree on your plan and your backup. Then one person explains it to the host.</p>
            </div>
          ) : locked ? (
            <div role="status" className="flex flex-col gap-1 rounded-[18px] border-[3px] border-ink bg-white p-5">
              <p className="text-sm font-bold tracking-[1px] text-body">LOCKED IN FOR YOUR TEAM</p>
              <p className="text-[28px] font-extrabold leading-tight">
                <span lang="ne">{ANSWER_SLOTS[locked.index].letter}</span> · {options[locked.index]}
              </p>
              {locked.by && <p className="text-base text-body">Chosen by {locked.by}.</p>}
              <p className="text-base text-body">Watch the big screen for the answer.</p>
            </div>
          ) : timeUp ? (
            <div role="status" className="flex flex-col gap-1 rounded-[18px] border-[3px] border-ink bg-white p-5">
              <p className="text-[28px] font-extrabold leading-tight">Time&apos;s up!</p>
              <p className="text-base text-body">No points lost. Watch the big screen for the answer.</p>
            </div>
          ) : (
            <>
              <p className="text-[15px] text-body">Choose your trail — same letter and colour as the flags on the big screen</p>
              <SignpostPost options={options} onSelect={onPick} disabled={sending || !onPick} />
            </>
          )}
          {error && (
            <p role="alert" className="text-[15px] font-bold text-danger">
              {error}
            </p>
          )}
          {children}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3.5">
          <ResultCard correct={result.correct} headline={result.headline} subline={result.subline} />
          {result.fact && <TrailFact title={result.fact.title}>{result.fact.text}</TrailFact>}
          {children}
        </div>
      )}
    </>
  );
}

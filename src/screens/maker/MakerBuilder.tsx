"use client";

import Link from "next/link";
import { useState } from "react";
import { ANSWER_SLOTS } from "@/lib/answers";
import { FLAG } from "@/lib/colors";
import { DEMO_QUESTION } from "@/lib/demo";
import { MakerTopBarShell } from "./MakerShell";

type Topic = "nepal" | "voting";

interface Draft {
  short: string;
  prompt: string;
  topic: Topic;
  timer: number;
  options: string[];
  correct: number;
  fact: string;
  event?: boolean;
}

const blank = (short: string, topic: Topic): Draft => ({ short, prompt: "", topic, timer: 20, options: ["", "", "", ""], correct: 0, fact: "" });

// Fake game content until save/load lands in milestone 3. Only the Dashain question is filled in.
const START: Draft[] = [
  blank("Everest in Nepali?", "nepal"),
  blank("Voting age (26th Amend.)", "voting"),
  blank("Flag shape", "nepal"),
  blank("Where to register", "voting"),
  {
    short: "Dashain length",
    prompt: DEMO_QUESTION.prompt,
    topic: "nepal",
    timer: 20,
    options: [...DEMO_QUESTION.options],
    correct: DEMO_QUESTION.correctIndex,
    fact: DEMO_QUESTION.trailFact,
  },
  { ...blank("Storm event cards", "voting"), event: true },
];

const TOPIC_DOT: Record<Topic, string> = { nepal: FLAG.red, voting: FLAG.blue };
const field = "rounded-xl border-2 border-ink bg-white";
const CHIP = "polygon(0 0, 100% 0, 100% 84%, 75% 100%, 50% 84%, 25% 100%, 0 84%)";

/** Question builder (design-reference/Maker-Builder.dc.html). */
export function MakerBuilder({ title }: { title: string }) {
  const [drafts, setDrafts] = useState(START);
  const [sel, setSel] = useState(4);
  const q = drafts[sel];
  const update = (patch: Partial<Draft>) => setDrafts(drafts.map((d, i) => (i === sel ? { ...d, ...patch } : d)));

  return (
    <MakerTopBarShell
      title={title}
      status="Saved"
      actions={
        <>
          <button type="button" className="min-h-11 cursor-pointer rounded-[10px] border-2 border-white bg-transparent px-[18px] text-base font-bold text-white">
            Save
          </button>
          <Link href="/maker/games/demo/host" className="flex min-h-11 items-center rounded-[10px] bg-flag-red px-[18px] text-base font-extrabold text-white no-underline">
            Host this game
          </Link>
        </>
      }
    >
      <div className="flex min-h-0 grow flex-col md:flex-row">
        <nav aria-label="Questions" className="flex shrink-0 flex-col gap-1.5 border-b-2 border-[#E2DED3] px-3.5 py-[18px] md:w-[270px] md:border-b-0 md:border-r-2">
          <p className="text-sm font-extrabold tracking-[1px] text-body">5 CHECKPOINTS · 12 QUESTIONS</p>
          <ol className="flex flex-col gap-1">
            {drafts.map((d, i) => (
              <li key={d.short}>
                <button
                  type="button"
                  aria-current={i === sel ? "true" : undefined}
                  onClick={() => setSel(i)}
                  className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[15px] ${
                    i === sel ? "border-2 border-ink bg-white font-bold" : "border-2 border-transparent bg-transparent"
                  }`}
                >
                  <b>{i + 1}</b>
                  <span className="grow">{d.short}</span>
                  {d.event ? (
                    <span className="text-xs font-extrabold text-flag-green-dark">EVENT</span>
                  ) : (
                    <span className="size-2.5 rounded-full" style={{ background: TOPIC_DOT[d.topic] }} aria-label={d.topic === "nepal" ? "Nepal culture" : "Voting"} />
                  )}
                </button>
              </li>
            ))}
            <li className="flex gap-2.5 px-2.5 py-2 text-[15px] text-body">
              <b>7–12</b>…
            </li>
          </ol>
          <button type="button" className="mt-1.5 min-h-11 cursor-pointer rounded-[10px] border-2 border-dashed border-[#8A86A0] bg-transparent text-base font-bold">
            + Add question
          </button>
          <p className="mt-auto flex gap-3 pt-3 text-[13px] text-body">
            <span>
              <span className="inline-block size-2.5 rounded-full bg-flag-red" aria-hidden /> Nepal culture
            </span>
            <span>
              <span className="inline-block size-2.5 rounded-full bg-flag-blue" aria-hidden /> Voting
            </span>
          </p>
        </nav>

        <section aria-label={`Question ${sel + 1}`} className="flex min-w-0 grow flex-col gap-3.5 px-7 py-[22px]">
          <div className="flex flex-wrap gap-3.5">
            <div className="flex min-w-[260px] grow flex-col gap-1">
              <label htmlFor="qtext" className="text-sm font-extrabold">
                Question {sel + 1}
              </label>
              <input
                id="qtext"
                value={q.prompt}
                placeholder={q.short}
                onChange={(e) => update({ prompt: e.target.value })}
                className={`${field} h-[50px] px-3.5 text-lg`}
              />
            </div>
            <div className="flex w-[180px] flex-col gap-1">
              <label htmlFor="qtopic" className="text-sm font-extrabold">
                Topic
              </label>
              <select id="qtopic" value={q.topic} onChange={(e) => update({ topic: e.target.value as Topic })} className={`${field} h-[50px] px-2.5 text-base`}>
                <option value="nepal">Nepali culture</option>
                <option value="voting">Voting in the U.S.</option>
              </select>
            </div>
            <div className="flex w-[120px] flex-col gap-1">
              <label htmlFor="qtime" className="text-sm font-extrabold">
                Timer
              </label>
              <select id="qtime" value={q.timer} onChange={(e) => update({ timer: Number(e.target.value) })} className={`${field} h-[50px] px-2.5 text-base`}>
                {[10, 20, 30].map((s) => (
                  <option key={s} value={s}>
                    {s} sec
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2 text-sm font-extrabold">Answers · mark the right one</legend>
            {ANSWER_SLOTS.map((slot, i) => (
              <div key={slot.letter} className="flex items-center gap-3">
                <span
                  lang="ne"
                  aria-hidden
                  className="flex size-[46px] shrink-0 items-center justify-center text-2xl font-extrabold"
                  style={{ background: slot.bg, color: slot.fg, clipPath: CHIP }}
                >
                  {slot.letter}
                </span>
                <input
                  aria-label={`Answer ${slot.letter}`}
                  value={q.options[i]}
                  onChange={(e) => update({ options: q.options.map((o, j) => (j === i ? e.target.value : o)) })}
                  className={`${field} h-[46px] min-w-0 grow px-3.5 text-[17px]`}
                />
                <button
                  type="button"
                  aria-pressed={i === q.correct}
                  onClick={() => update({ correct: i })}
                  className={`min-h-[46px] w-[150px] shrink-0 cursor-pointer rounded-xl border-2 text-[15px] font-extrabold ${
                    i === q.correct ? "border-flag-green-dark bg-flag-green-dark text-white" : "border-ink bg-white text-ink"
                  }`}
                >
                  {i === q.correct ? "Right answer ✓" : "Mark right"}
                </button>
              </div>
            ))}
          </fieldset>

          <div className="flex flex-col gap-1">
            <label htmlFor="qfact" className="text-sm font-extrabold">
              Trail fact (shown after the reveal)
            </label>
            <textarea
              id="qfact"
              rows={2}
              value={q.fact}
              onChange={(e) => update({ fact: e.target.value })}
              className={`${field} resize-none px-3.5 py-2.5 text-base`}
            />
          </div>
        </section>
      </div>
    </MakerTopBarShell>
  );
}

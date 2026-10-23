"use client";

import Link from "next/link";
import { useState } from "react";
import { DEMO_PIN, formatPin } from "@/lib/demo";
import { MAKER, MakerTopBarShell } from "./MakerShell";

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
export function MakerHostSetup({ title }: { title: string }) {
  const [mode, setMode] = useState<Mode>("buttons");
  const [teams, setTeams] = useState("5");
  const buttons = mode === "buttons";
  const modeName = buttons ? "Buttons mode" : "Buzzer mode";

  return (
    <MakerTopBarShell title={`Host: ${title}`} actions={<span className="text-[15px] text-[#B9B5C9]">Signed in as {MAKER.name}</span>}>
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
              <select id="htimer" key={mode} defaultValue={buttons ? "20" : "10"} className={select}>
                {(buttons ? [10, 20, 30] : [5, 10, 15]).map((s) => (
                  <option key={s} value={s}>
                    {buttons ? `${s} seconds` : `${s} seconds each`}
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
        </div>

        <aside className="flex shrink-0 flex-col gap-3 rounded-[20px] border-[3px] border-ink bg-white p-[22px] lg:w-[340px] lg:self-start">
          <h2 className="text-xl font-extrabold">Ready to open Base Camp</h2>
          <p className="text-base leading-normal">
            5 checkpoints · 60 minutes · {modeName} · {teams} teams
            <br />
            Projector: this laptop
            <br />
            Players: phones, no account
          </p>
          <div className="rounded-[14px] bg-maker p-3.5 text-center">
            <p className="text-sm text-body">Game PIN (made when you open)</p>
            <p className="text-[40px] font-extrabold leading-tight tracking-[4px]">{formatPin(DEMO_PIN)}</p>
          </div>
          <Link href={`/host/${DEMO_PIN}`} className="flex min-h-14 items-center justify-center rounded-[14px] bg-flag-red text-xl font-extrabold text-white no-underline">
            Open Base Camp
          </Link>
          <p className="text-sm leading-snug text-body">
            Host controls: Start · Reveal · Next checkpoint · Storm card · Award points · Voting plan · End
          </p>
        </aside>
      </div>
    </MakerTopBarShell>
  );
}

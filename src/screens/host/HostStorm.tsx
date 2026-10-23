"use client";

import { useState } from "react";
import { TimerRing } from "@/components/ui/TimerRing";
import { FLAG, INK } from "@/lib/colors";
import type { DemoTeam } from "@/lib/demo";

interface HostStormProps {
  card: { title: string; body: string };
  cardNumber: number;
  cardTotal: number;
  teams: DemoTeam[];
  timeLeft: string;
  onFinalAscent: () => void;
  onResults: () => void;
}

const AWARDS = [
  { key: "plan", label: "+10 plan", points: 10, aria: "a practical plan" },
  { key: "backup", label: "+5 backup", points: 5, aria: "a backup plan" },
  { key: "team", label: "+5 team", points: 5, aria: "teamwork" },
] as const;

/** Checkpoint 3: Storm Zone event card with the host scorecard (design-reference/Host-Storm.dc.html). */
export function HostStorm({ card, cardNumber, cardTotal, teams, timeLeft, onFinalAscent, onResults }: HostStormProps) {
  const [awarded, setAwarded] = useState<Record<string, number>>({});
  const award = (id: string, n: number) => setAwarded((a) => ({ ...a, [id]: (a[id] ?? 0) + n }));

  return (
    <>
      <svg width="1280" height="720" viewBox="0 0 1280 720" aria-hidden className="absolute inset-0">
        <path d="M0 720 L0 560 L160 440 L300 520 L460 380 L620 520 L760 450 L760 720 Z" fill="#B9C6DE" />
        <path d="M460 380 L620 520 L760 450 L760 720 L520 720 L500 520 Z" fill="#9FB0D2" />
        <g fill="#8A93A8">
          <ellipse cx="200" cy="120" rx="150" ry="44" />
          <ellipse cx="320" cy="96" rx="110" ry="50" />
          <ellipse cx="560" cy="130" rx="140" ry="42" />
        </g>
        <path d="M300 150 L272 206 L298 206 L276 262" fill="none" stroke={FLAG.yellow} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
        <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.7">
          <path d="M120 300 L104 330" />
          <path d="M220 340 L204 370" />
          <path d="M380 300 L364 330" />
          <path d="M560 330 L544 360" />
          <path d="M660 290 L644 320" />
          <path d="M60 420 L44 450" />
        </g>
      </svg>

      <div className="absolute left-14 top-9 flex flex-col gap-1">
        <p className="text-[17px] font-extrabold tracking-[1px] text-danger">CHECKPOINT 3 · THE STORM ZONE</p>
        <h1 className="text-[50px] font-extrabold leading-none">Surprise event!</h1>
      </div>

      <div className="absolute left-14 top-[150px] flex w-160 flex-col gap-2.5 rounded-[22px] border-4 border-ink bg-page px-[26px] py-[22px] shadow-ink">
        <div className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 3 L22 20 H2 Z" fill={FLAG.yellow} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 9 V14" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1.3" fill={INK} />
          </svg>
          <span className="text-base font-extrabold tracking-[1px]">
            EVENT CARD {cardNumber} OF {cardTotal}
          </span>
        </div>
        <p className="text-[34px] font-extrabold leading-tight">{card.title}</p>
        <p className="text-xl leading-snug text-[#3A3550]">{card.body}</p>
        <p className="text-base text-body">Two minutes to talk. Then one person explains your plan. Did any of your supplies help?</p>
      </div>

      <div className="absolute left-14 top-[476px] w-160 rounded-[18px] bg-ink px-5 py-3.5 text-cream">
        <p className="text-sm font-extrabold tracking-[1px] text-marigold">AFTER THE ANSWERS · THE VOTING LINK</p>
        <p className="text-lg leading-snug">
          If your voting plan falls through, like a moved polling place or a missed day, check official sources for the options open to
          you, such as early voting, voting by mail or a different location.
        </p>
      </div>

      <div className="absolute right-10 top-9 flex w-[486px] flex-col gap-3">
        <div className="flex items-center gap-4 rounded-[20px] border-[3px] border-ink bg-white px-[18px] py-3.5">
          <TimerRing value={timeLeft} label={`${timeLeft} left to plan`} color="#B91C1C" size={80} />
          <p className="text-[17px] leading-snug">
            <b>Teams are planning</b>
            <br />
            Practical, informed plans score best, not the fastest answer.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 rounded-[20px] border-[3px] border-ink bg-white px-[18px] py-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[19px] font-extrabold">Host scorecard</span>
            <span className="text-[13px] text-body">tap to award</span>
          </div>
          <ul className="flex flex-col gap-1">
            {teams.map(({ team }) => (
              <li key={team.id} className="flex items-center gap-2">
                <span className="size-3.5 shrink-0 rounded border-2 border-ink" style={{ background: team.color }} aria-hidden />
                <span className="min-w-0 grow text-sm font-bold leading-tight">{team.name}</span>
                {AWARDS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => award(team.id, a.points)}
                    aria-label={`Award ${team.name} ${a.points} points for ${a.aria}`}
                    className="min-h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-lg border-2 border-ink bg-cream px-1.5 text-xs font-extrabold"
                  >
                    {a.label}
                  </button>
                ))}
                <b className="w-[34px] text-right text-[17px]" aria-live="polite">
                  +{awarded[team.id] ?? 0}
                </b>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setAwarded({})}
            className="min-h-8 cursor-pointer self-start rounded-lg border-0 bg-transparent px-2.5 text-[13px] underline"
          >
            Reset this round
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onFinalAscent} className="min-h-[52px] cursor-pointer rounded-[14px] border-0 bg-ink text-[17px] font-extrabold text-white">
            Next: Final Ascent
          </button>
          <button type="button" onClick={onResults} className="min-h-[52px] cursor-pointer rounded-[14px] border-2 border-ink bg-white text-[17px] font-bold">
            Final results
          </button>
        </div>
      </div>
    </>
  );
}

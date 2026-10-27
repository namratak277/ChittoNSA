"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { PrayerFlagBunting } from "@/components/brand/PrayerFlagBunting";
import { DEBRIEF_QUESTIONS } from "@/lib/demo";
import { LOCAL, OFFICIAL_LINKS } from "@/lib/settings";
import { useSettings } from "@/lib/useSettings";

interface HostPledgeProps {
  plansMade: number;
  climbers: number;
  onEnd: () => void;
}

/** Checkpoint 5: From the summit to the ballot, with debrief (design-reference/Host-Pledge.dc.html). */
export function HostPledge({ plansMade, climbers, onEnd }: HostPledgeProps) {
  const settings = useSettings();
  const [q, setQ] = useState(0);
  const n = DEBRIEF_QUESTIONS.length;
  const pct = climbers ? Math.round((plansMade / climbers) * 100) : 0;

  return (
    <>
      <svg width="1280" height="720" viewBox="0 0 1280 720" aria-hidden className="absolute inset-0">
        <circle cx="820" cy="250" r="52" fill="#FFF1C2" />
        <path d="M760 720 L900 560 L990 470 L1060 380 L1110 300 L1160 380 L1230 470 L1280 520 L1280 720 Z" fill="#DCE7FA" />
        <path d="M1110 300 L1160 380 L1230 470 L1280 520 L1280 720 L1180 720 L1150 560 L1130 420 Z" fill="#C7D9F7" />
        <path d="M1090 332 L1110 300 L1130 332 L1120 328 L1110 342 L1100 328 Z" fill="#FFFFFF" />
      </svg>
      <PrayerFlagBunting className="absolute left-0 top-0" />

      <div className="absolute left-16 top-[108px] flex w-[720px] flex-col gap-3">
        <p className="text-xl font-extrabold tracking-[1px] text-chili">CHECKPOINT 5 · THE SUMMIT</p>
        <h1 className="-mt-1.5 text-6xl font-extrabold leading-none">From the summit to the ballot</h1>
        <p className="text-xl leading-snug text-body">
          You planned your climb. Now plan your vote. Everyone fills in their own voting plan on their phone, then we talk it through.
        </p>
        <section aria-label="Debrief" className="mt-1 flex flex-col gap-2.5 rounded-[18px] border-[3px] border-ink bg-white px-5 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold">Talk it over</span>
            <span className="text-[15px] text-body">
              Question {q + 1} of {n}
            </span>
          </div>
          <p className="min-h-[68px] text-[28px] font-extrabold leading-tight" aria-live="polite">
            {DEBRIEF_QUESTIONS[q]}
          </p>
          <div className="flex gap-2.5">
            <button type="button" onClick={() => setQ((q - 1 + n) % n)} className="min-h-11 cursor-pointer rounded-xl border-2 border-ink bg-white px-[18px] text-base font-bold">
              Back
            </button>
            <button type="button" onClick={() => setQ((q + 1) % n)} className="min-h-11 cursor-pointer rounded-xl border-0 bg-ink px-[18px] text-base font-extrabold text-white">
              Next question
            </button>
          </div>
        </section>
        <p className="text-[22px] font-extrabold leading-snug">
          &ldquo;Climbing Everest takes preparation, reliable information and a plan for surprises. So does voting.&rdquo;
        </p>
      </div>

      <div className="absolute right-16 top-[120px] flex w-[330px] flex-col gap-3 rounded-3xl border-[3px] border-ink bg-white p-5">
        <p className="text-xl font-extrabold">Voting plans made</p>
        <div className="flex justify-between text-[22px] font-extrabold">
          <span>
            {plansMade} of {climbers}
          </span>
          <span>{pct}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Voting plans made"
          aria-valuenow={plansMade}
          aria-valuemin={0}
          aria-valuemax={climbers}
          className="h-[22px] overflow-hidden rounded-[11px] border-[3px] border-ink bg-white"
        >
          <div className="h-full bg-flag-green transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="border-t-2 border-dashed border-rule pt-1.5 text-base leading-relaxed">
          Official info, always:
          <br />
          <b>ncsbe.gov</b> (NC registration, polling places, early voting; {LOCAL.city} votes in {LOCAL.county})
          <br />
          <b>vote.gov</b> (registered in another state)
        </p>
        <p className="text-base">
          Election Day: <b>{settings.electionDate}</b>
          <br />
          Register by: <b>{settings.registrationDeadline}</b>
        </p>
        <div className="flex flex-col items-center gap-1 self-center">
          <QRCodeSVG value={OFFICIAL_LINKS.ncsbeVoting.href} size={110} fgColor="#1E1B2E" title="Scan for NC voting info on ncsbe.gov" />
          <span className="text-sm text-body">Scan for NC voting info · ncsbe.gov</span>
        </div>
        <button type="button" onClick={onEnd} className="min-h-12 cursor-pointer rounded-[14px] border-0 bg-flag-red text-lg font-extrabold text-white">
          End game · back to Base Camp
        </button>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { OFFICIAL_LINKS } from "@/lib/settings";
import { Eyebrow } from "./parts";

const WHEN = ["Early voting", "Election Day", "By mail"] as const;
const CHECKS = ["I'm registered at my current address", "What ID or documents I need", "My polling place and its hours"] as const;
const WHERE = ["My state election board website", "vote.gov", "My county board of elections"] as const;

interface PlayerPledgeProps {
  /** Called once when the plan is first saved. Only this fact is sent to the server, never the plan. */
  onPlanMade: () => void;
}

/**
 * My voting plan (design-reference/Phone-Pledge.dc.html). The plan stays on this phone;
 * it never asks who anyone votes for.
 */
export function PlayerPledge({ onPlanMade }: PlayerPledgeProps) {
  const [when, setWhen] = useState(0);
  const [how, setHow] = useState("");
  const [checks, setChecks] = useState([true, false, false]);
  const [where, setWhere] = useState<string>(WHERE[0]);
  const [saved, setSaved] = useState(false);
  const [counted, setCounted] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    if (!counted) {
      setCounted(true);
      onPlanMade();
    }
  }

  return (
    <>
      <div>
        <Eyebrow className="text-chili">CHECKPOINT 5 · THE SUMMIT</Eyebrow>
        <h1 className="text-[30px] font-extrabold leading-[1.05]">My voting plan</h1>
        <p className="text-[15px] text-body">Just for you. We only count that a plan was made, never what&apos;s in it.</p>
      </div>

      {!saved ? (
        <form onSubmit={save} className="flex flex-1 flex-col gap-3">
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-base font-extrabold">1 · When will I vote?</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {WHEN.map((w, i) => (
                <button
                  key={w}
                  type="button"
                  aria-pressed={i === when}
                  onClick={() => setWhen(i)}
                  className={`min-h-[46px] cursor-pointer rounded-xl border-2 border-ink text-sm font-extrabold ${
                    i === when ? "bg-ink text-marigold" : "bg-white text-ink"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="how" className="text-base font-extrabold">
              2 · How will I get there?
            </label>
            <input
              id="how"
              value={how}
              onChange={(e) => setHow(e.target.value)}
              placeholder="e.g. walk with my roommate after class"
              className="h-[46px] rounded-xl border-2 border-ink bg-white px-3 text-base"
            />
          </div>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-base font-extrabold">3 · What do I need to check?</legend>
            {CHECKS.map((c, i) => (
              <label key={c} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border-2 border-ink bg-white px-3 text-[15px] font-semibold">
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() => setChecks(checks.map((v, j) => (j === i ? !v : v)))}
                  className="size-6 accent-flag-green-dark"
                />
                {c}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="where" className="text-base font-extrabold">
              4 · Where will I check for updates?
            </label>
            <select
              id="where"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              className="h-[46px] rounded-xl border-2 border-ink bg-white px-2.5 text-base"
            >
              {WHERE.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-auto min-h-[54px] cursor-pointer rounded-2xl border-0 bg-flag-red text-[21px] font-extrabold text-white">
            Save my plan
          </button>
        </form>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <div role="status" className="flex flex-col gap-1.5 rounded-[18px] border-[3px] border-ink bg-success-bg p-[18px]">
            <p className="text-[28px] font-extrabold leading-[1.05]">Plan made. Summit reached!</p>
            <p className="text-[17px] leading-snug">
              I&apos;ll vote: <b>{WHEN[when]}</b>
              {how && (
                <>
                  <br />
                  Getting there: <b>{how}</b>
                </>
              )}
              <br />
              Things to check: <b>{checks.filter(Boolean).length} of 3</b>
              <br />
              Updates from: <b>{where}</b>
            </p>
            <p className="text-[15px] text-[#3A3550]">Take a screenshot so you have it on Election Day.</p>
          </div>
          {[OFFICIAL_LINKS.voteGov, OFFICIAL_LINKS.ncsbe].map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[52px] items-center justify-center rounded-[14px] border-[3px] border-flag-blue text-lg font-extrabold text-flag-blue no-underline"
            >
              {i === 0 ? "Check registration" : "NC voting info"} · {l.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setSaved(false)}
            className="mt-auto min-h-11 cursor-pointer rounded-[14px] border-2 border-ink bg-white text-base font-bold"
          >
            Edit my plan
          </button>
        </div>
      )}
    </>
  );
}

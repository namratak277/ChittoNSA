"use client";

import { useState } from "react";
import { SUPPLIES, SUPPLY_BUDGET, suppliesCost, type SupplyId } from "@/lib/supplies";
import type { Team } from "@/lib/teams";
import { Eyebrow } from "./parts";

interface PlayerSuppliesProps {
  team: Team;
  nextQuestion: string;
}

/** Checkpoint 1: pack your team's supplies (design-reference/Phone-Supplies.dc.html). */
export function PlayerSupplies({ team, nextQuestion }: PlayerSuppliesProps) {
  const [picked, setPicked] = useState<SupplyId[]>(["map", "radio", "food"]);
  const [locked, setLocked] = useState(false);
  const [msg, setMsg] = useState("");
  const spent = suppliesCost(picked);

  function toggle(id: SupplyId, cost: number) {
    if (picked.includes(id)) {
      setPicked(picked.filter((p) => p !== id));
      setMsg("");
    } else if (spent + cost > SUPPLY_BUDGET) {
      setMsg("Not enough points. Drop something first.");
    } else {
      setPicked([...picked, id]);
      setMsg("");
    }
  }

  return (
    <>
      <div>
        <Eyebrow>CHECKPOINT 1 · BASE CAMP · {team.name.toUpperCase()}</Eyebrow>
        <h1 className="text-[28px] font-extrabold leading-[1.05]">Pack your team&apos;s supplies</h1>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-base font-extrabold">
          <span>Supply points</span>
          <span>
            {spent} of {SUPPLY_BUDGET} used
          </span>
        </div>
        <div
          role="meter"
          aria-label="Supply points used"
          aria-valuemin={0}
          aria-valuemax={SUPPLY_BUDGET}
          aria-valuenow={spent}
          className="grid grid-cols-10 gap-[3px]"
        >
          {Array.from({ length: SUPPLY_BUDGET }, (_, i) => (
            <div key={i} className={`h-3.5 rounded border-2 border-ink ${i < spent ? "bg-marigold" : "bg-white"}`} />
          ))}
        </div>
      </div>

      {!locked ? (
        <>
          <div className="flex flex-col gap-2">
            {SUPPLIES.map((s) => {
              const on = picked.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.id, s.cost)}
                  className={`flex min-h-[58px] cursor-pointer items-center gap-3 rounded-[14px] px-3 py-1.5 text-ink ${
                    on ? "border-[3px] border-ink bg-white" : "border-2 border-quiet bg-[#FBFAF6]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex size-[30px] shrink-0 items-center justify-center rounded-lg border-2 border-ink font-extrabold ${
                      on ? "bg-flag-green-dark text-white" : "bg-white"
                    }`}
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span className="grow text-left">
                    <b className="text-lg">{s.name}</b>
                    <br />
                    <span className="text-sm text-body">{s.helps}</span>
                  </span>
                  <span className="rounded-full bg-ink px-2.5 text-base font-extrabold text-marigold" aria-label={`costs ${s.cost}`}>
                    {s.cost}
                  </span>
                </button>
              );
            })}
          </div>
          <p role="alert" className="min-h-5 text-sm font-bold text-danger">
            {msg}
          </p>
          <button
            type="button"
            onClick={() => setLocked(true)}
            className="mt-auto min-h-14 cursor-pointer rounded-2xl border-0 bg-flag-red text-[21px] font-extrabold text-white"
          >
            Lock in our supplies
          </button>
        </>
      ) : (
        <>
          <div role="status" className="flex flex-col gap-1.5 rounded-[18px] border-[3px] border-ink bg-success-bg p-[18px]">
            <p className="text-[28px] font-extrabold leading-[1.05]">Packed and ready!</p>
            <p className="text-base leading-snug">
              {picked.map((id) => SUPPLIES.find((s) => s.id === id)!.name).join(" · ") || "Nothing packed yet"}
            </p>
            <p className="text-[15px] text-body">Your supplies can help at later checkpoints, so watch for the Storm Zone.</p>
          </div>
          <p className="rounded-2xl bg-ink px-4 py-3.5 text-lg font-bold leading-snug text-cream">
            Next on the big screen: &ldquo;{nextQuestion}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setLocked(false)}
            className="mt-auto min-h-[46px] cursor-pointer rounded-[14px] border-2 border-ink bg-white text-base font-bold"
          >
            Change supplies
          </button>
        </>
      )}
    </>
  );
}

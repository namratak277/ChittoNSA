"use client";

import { FlagRope } from "@/components/answers/FlagRope";
import { HostStage } from "@/components/layout/HostStage";
import { Mountain } from "@/components/mountain/Mountain";
import { MountainMarkers } from "@/components/mountain/MountainMarkers";
import { Card } from "@/components/ui/Card";
import { useClimb } from "../demos";

// Full-screen projector test: checks stage scaling, letterboxing and the narrow-screen notice.
export default function StageTestPage() {
  const climb = useClimb(5);
  return (
    <HostStage>
      <Mountain className="absolute inset-0" />
      <MountainMarkers markers={climb.markers} />
      <div className="absolute left-[330px] top-[18px] w-[620px] text-center">
        <p className="text-[17px] font-bold tracking-[1px] text-flag-red">CHECKPOINT 2 · THE ROUTE · TRAIL QUESTION</p>
        <p className="text-[30px] font-extrabold leading-tight">Dashain, Nepal&apos;s biggest festival, lasts how many days?</p>
      </div>
      <Card className="absolute right-10 top-[150px] flex w-[230px] flex-col gap-2 p-[18px]">
        <p className="text-xl font-extrabold">Move a team</p>
        {climb.teams.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => climb.advance(i)}
            className="min-h-11 cursor-pointer rounded-xl border-2 border-ink bg-white px-3 text-left text-base font-bold"
          >
            {t.name} ↑
          </button>
        ))}
      </Card>
      <FlagRope options={["3 days", "7 days", "15 days", "30 days"]} />
    </HostStage>
  );
}

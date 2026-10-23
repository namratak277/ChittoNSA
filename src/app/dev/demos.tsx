"use client";

import { useState } from "react";
import { FlagRope } from "@/components/answers/FlagRope";
import { SignpostPost } from "@/components/answers/SignpostPost";
import type { ClimberStyle } from "@/components/climbers/ClimberMarker";
import { Mountain } from "@/components/mountain/Mountain";
import { MountainMarkers, type MountainMarker } from "@/components/mountain/MountainMarkers";
import { Button } from "@/components/ui/Button";
import { ANSWER_SLOTS } from "@/lib/answers";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { teamsFor } from "@/lib/teams";

// Fake data for milestone 1 demos.
const DASHAIN = ["3 days", "7 days", "15 days", "30 days"];
const INFO_CARDS = ["Official election board site", "Last year's flyer", "A friend's social post"];
const STYLES: ClimberStyle[] = ["topi", "topi", "headlamp", "topi", "headlamp", "topi"];

/** A 1280×720 stage drawn at a fixed smaller scale, for previews on this page. */
export function StagePreview({ children, scale = 0.6 }: { children: React.ReactNode; scale?: number }) {
  return (
    <div className="w-fit max-w-full overflow-x-auto rounded-xl border-[3px] border-ink">
      <div style={{ width: 1280 * scale, height: 720 * scale }}>
        <div className="relative origin-top-left overflow-hidden bg-page" style={{ width: 1280, height: 720, transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function useClimb(count: 4 | 5 | 6 = 5) {
  const teams = teamsFor(count);
  const [checkpoints, setCheckpoints] = useState<number[]>(() => teams.map(() => 0));
  const markers: MountainMarker[] = teams.map((team, i) => ({ team, style: STYLES[i], checkpoint: checkpoints[i] ?? 0 }));
  const advance = (i: number) =>
    setCheckpoints((cps) => cps.map((c, j) => (j === i ? Math.min(c + 1, CHECKPOINTS.length - 1) : c)));
  const reset = () => setCheckpoints(teams.map(() => 0));
  const scatter = () => setCheckpoints(teams.map((_, i) => [3, 2, 2, 1, 1, 0][i] ?? 0));
  return { teams, markers, checkpoints, advance, reset, scatter };
}

export function MountainDemo() {
  const climb = useClimb(5);
  return (
    <div className="flex flex-col gap-3">
      <StagePreview>
        <Mountain className="absolute inset-0" />
        <MountainMarkers markers={climb.markers} />
      </StagePreview>
      <div className="flex flex-wrap gap-2">
        {climb.teams.map((t, i) => (
          <Button key={t.id} size="sm" variant="outline" onClick={() => climb.advance(i)}>
            {t.name} climbs ↑
          </Button>
        ))}
        <Button size="sm" variant="ink" onClick={climb.scatter}>
          Spread out
        </Button>
        <Button size="sm" variant="ink" onClick={climb.reset}>
          Back to Base Camp
        </Button>
      </div>
    </div>
  );
}

export function FlagDemo() {
  const [revealed, setRevealed] = useState(false);
  const [three, setThree] = useState(false);
  const options = three ? INFO_CARDS : DASHAIN;
  return (
    <div className="flex flex-col gap-3">
      <StagePreview>
        <FlagRope
          options={options}
          reveal={revealed ? { correctIndex: three ? 0 : 2, teamCounts: three ? [3, 1, 1] : [0, 1, 4, 0] } : undefined}
        />
      </StagePreview>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={revealed ? "outline" : "success"} onClick={() => setRevealed((r) => !r)}>
          {revealed ? "Hide answer" : "Reveal answer"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setThree((t) => !t)}>
          {three ? "Show 4 answers" : "Show 3 info cards"}
        </Button>
      </div>
    </div>
  );
}

export function SignpostDemo() {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="flex w-full max-w-[390px] flex-col gap-3 rounded-xl border-[3px] border-ink bg-page p-5">
      <p className="text-[15px] text-body">Choose your trail — same letter and colour as the flags on the big screen</p>
      <SignpostPost options={DASHAIN} onSelect={setPicked} disabled={picked !== null} />
      <p aria-live="polite" className="min-h-7 text-lg font-bold">
        {picked !== null && (
          <>
            Locked in <span lang="ne">{ANSWER_SLOTS[picked].letter}</span> · {DASHAIN[picked]}{" "}
            <button type="button" className="ml-2 cursor-pointer underline" onClick={() => setPicked(null)}>
              reset
            </button>
          </>
        )}
      </p>
    </div>
  );
}

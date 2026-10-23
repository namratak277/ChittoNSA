"use client";

import { useLayoutEffect, useRef } from "react";
import { ClimberMarker, type ClimberStyle } from "@/components/climbers/ClimberMarker";
import { CHECKPOINTS, trailPoint } from "@/lib/checkpoints";
import type { Team } from "@/lib/teams";

export interface MountainMarker {
  team: Team;
  /** The style of the first player who joined the team. */
  style: ClimberStyle;
  /** Checkpoint index, 0 (Base Camp) to 4 (Summit). */
  checkpoint: number;
}

const SIZE = 40;
const GAP = 4;
// Groups sit just right of the stop, vertically centred on it.
const OFFSET_X = 16;
const OFFSET_Y = -SIZE / 2;

interface Placement {
  progress: number;
  slot: number;
}

function transformFor({ progress, slot }: Placement) {
  const p = trailPoint(progress);
  const x = p.x + OFFSET_X + slot * (SIZE + GAP);
  const y = p.y + OFFSET_Y;
  return `translate(${x}px, ${y}px)`;
}

/**
 * One climber per team on the 1280×720 host stage. Teams at the same checkpoint
 * stand side by side; when a team advances it walks along the trail to its new stop.
 */
export function MountainMarkers({ markers }: { markers: MountainMarker[] }) {
  const filled = new Map<number, number>();
  return (
    <div className="pointer-events-none absolute inset-0">
      {markers.map((m) => {
        const checkpoint = Math.min(Math.max(Math.round(m.checkpoint), 0), CHECKPOINTS.length - 1);
        const slot = filled.get(checkpoint) ?? 0;
        filled.set(checkpoint, slot + 1);
        return (
          <MovingMarker key={m.team.id} progress={checkpoint} slot={slot}>
            <ClimberMarker
              style={m.style}
              team={m.team}
              size={SIZE}
              label={`${m.team.name} at ${CHECKPOINTS[checkpoint].name}`}
            />
          </MovingMarker>
        );
      })}
    </div>
  );
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function MovingMarker({ progress, slot, children }: Placement & { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRef<Placement>({ progress, slot });

  // Layout effect: React has already written the target transform, so put the marker
  // back where it was before the browser paints, then animate forward.
  useLayoutEffect(() => {
    const el = ref.current;
    const from = shown.current;
    if (!el || (from.progress === progress && from.slot === slot)) return;

    el.style.transform = transformFor(from);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const distance = Math.abs(progress - from.progress);
    const duration = reduceMotion ? 0 : Math.min(2400, 500 + 700 * distance);
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const e = easeInOut(t);
      const current = {
        progress: from.progress + (progress - from.progress) * e,
        slot: from.slot + (slot - from.slot) * e,
      };
      shown.current = current;
      el.style.transform = transformFor(current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [progress, slot]);

  return (
    <div ref={ref} className="absolute left-0 top-0 will-change-transform" style={{ transform: transformFor({ progress, slot }) }}>
      {children}
    </div>
  );
}

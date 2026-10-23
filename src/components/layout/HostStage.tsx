"use client";

import { useSyncExternalStore } from "react";

export const STAGE_WIDTH = 1280;
export const STAGE_HEIGHT = 720;

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

const fitScale = () => Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);

interface HostStageProps {
  children: React.ReactNode;
  /** Stage background class, e.g. "bg-page" or "bg-[#DDE3EE]" for the storm. */
  className?: string;
}

/**
 * Fixed 1280×720 projector stage, scaled to fill the screen with letterboxing.
 * Children are laid out in stage pixels, exactly like the design-reference mockups.
 * On narrow screens it shows a notice instead.
 */
export function HostStage({ children, className = "bg-page" }: HostStageProps) {
  const scale = useSyncExternalStore(subscribe, fitScale, () => 1);
  return (
    <>
      <div className="flex min-h-dvh items-center justify-center bg-page p-6 text-center md:hidden">
        <p className="max-w-xs text-2xl font-extrabold">Open this on a laptop connected to the projector.</p>
      </div>
      <div className="fixed inset-0 hidden items-center justify-center overflow-hidden bg-ink md:flex">
        <div
          className={`relative shrink-0 overflow-hidden ${className}`}
          style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

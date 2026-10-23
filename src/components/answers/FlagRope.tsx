import { ANSWER_SLOTS } from "@/lib/answers";
import { INK } from "@/lib/colors";
import { FlagAnswer, type FlagState } from "./FlagAnswer";

interface FlagRopeProps {
  /** 2–4 answer labels, in क ख ग घ order. */
  options: string[];
  /** Set after the reveal. */
  reveal?: { correctIndex: number; teamCounts: number[] };
}

const STAGE_W = 1280;
const MARGIN = 60;
const FLAG_H = 70;
// Fewer answers (e.g. 3 Route Checkpoint info cards) get wider flags.
const FLAG_W: Record<number, number> = { 2: 400, 3: 320, 4: 260 };

/** Height of the sagging rope (relative to the rope box) at x. Matches the path below. */
function ropeY(x: number) {
  const t = (x - 20) / (STAGE_W - 40);
  return 14 + 72 * t * (1 - t);
}

/**
 * Answer flags hanging from a rope along the bottom 100px of the 1280×720 host stage.
 * Place inside a positioned stage; it pins itself to the bottom.
 */
export function FlagRope({ options, reveal }: FlagRopeProps) {
  const n = Math.min(Math.max(options.length, 2), 4);
  const w = FLAG_W[n];
  const gap = (STAGE_W - 2 * MARGIN - n * w) / (n - 1);

  return (
    <div className="absolute bottom-0 left-0 h-[100px] w-[1280px]">
      {/* Rope first so the flags' folded tops hang over it. */}
      <svg width="1280" height="80" viewBox="0 0 1280 80" aria-hidden className="absolute left-0 top-0">
        <path d="M20 14 Q640 50 1260 14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="20" cy="14" r="5" fill={INK} />
        <circle cx="1260" cy="14" r="5" fill={INK} />
      </svg>
      <ol aria-label="Answers" className="absolute inset-0 m-0 p-0">
        {options.slice(0, n).map((label, i) => {
          const left = MARGIN + i * (w + gap);
          const top = ropeY(left + w / 2) - 5;
          const state: FlagState = !reveal ? "idle" : reveal.correctIndex === i ? "correct" : "wrong";
          const grow = state === "correct" ? { left: left - 10, top: top - 12, width: w + 20, height: FLAG_H + 12 } : null;
          return (
            <li key={i} className="list-none">
              <FlagAnswer
                slot={ANSWER_SLOTS[i]}
                label={label}
                state={state}
                teamCount={reveal?.teamCounts[i]}
                className="absolute box-border"
                style={grow ?? { left, top, width: w, height: FLAG_H }}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

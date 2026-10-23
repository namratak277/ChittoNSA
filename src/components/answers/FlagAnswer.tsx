import { FLAG_CLIP, type AnswerSlot } from "@/lib/answers";

export type FlagState = "idle" | "wrong" | "correct";

interface FlagAnswerProps {
  slot: AnswerSlot;
  label: string;
  state?: FlagState;
  /** Shown after the reveal, e.g. "4 teams". */
  teamCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

const teamsText = (n: number) => `${n} ${n === 1 ? "team" : "teams"}`;

/**
 * One prayer-flag answer for the projector: coloured cloth with a ragged bottom edge,
 * a slight tilt and the Nepali letter. On reveal, wrong flags fade to 30% and the
 * correct flag straightens, grows and shows a check.
 */
export function FlagAnswer({ slot, label, state = "idle", teamCount, className, style }: FlagAnswerProps) {
  const correct = state === "correct";
  const count = state !== "idle" && teamCount !== undefined ? teamsText(teamCount) : null;
  return (
    <div
      className={`flex items-center gap-3 font-extrabold transition-all duration-500 ease-out ${
        correct ? "px-[18px] pb-3 pt-3.5 text-2xl" : "px-[18px] pb-2.5 pt-3 text-[22px]"
      } ${className ?? ""}`}
      style={{
        background: slot.bg,
        color: slot.fg,
        clipPath: FLAG_CLIP,
        boxShadow: `inset 0 9px 0 ${slot.foldShadow}`,
        transform: correct ? "none" : `rotate(${slot.flagTilt}deg)`,
        opacity: state === "wrong" ? 0.3 : 1,
        ...style,
      }}
    >
      <span
        lang="ne"
        aria-hidden={correct}
        className={`flex shrink-0 items-center justify-center rounded-full ${correct ? "size-9" : "size-[34px] text-xl"}`}
        style={{ background: slot.badgeBg, color: slot.badgeFg }}
      >
        {correct ? (
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path d="M4 12 L10 18 L20 6" fill="none" stroke={slot.badgeFg} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          slot.letter
        )}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span>
          {correct && (
            <>
              <span className="sr-only">Correct answer: </span>
              <span lang="ne">{slot.letter}</span> ·{" "}
            </>
          )}
          {label}
        </span>
        {count && (
          <span className="text-base font-bold">
            <span className="sr-only">, </span>
            {count}
          </span>
        )}
      </span>
    </div>
  );
}

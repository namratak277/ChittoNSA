import { SIGN_CLIP, type AnswerSlot } from "@/lib/answers";

interface SignpostAnswerProps {
  slot: AnswerSlot;
  label: string;
  /** Position on the post; every other sign is slightly shorter. */
  index: number;
  onSelect?: () => void;
  disabled?: boolean;
  /** Slightly shorter boards (Buzzer mode answer turn). */
  compact?: boolean;
}

/**
 * One arrow-shaped trail sign for phones, matching the flag with the same letter and colour.
 * The button itself is unclipped so the focus ring stays visible; the board inside is clipped.
 */
export function SignpostAnswer({ slot, label, index, onSelect, disabled, compact }: SignpostAnswerProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className="block cursor-pointer border-0 bg-transparent p-0 text-left transition-transform active:scale-[0.98] disabled:cursor-default disabled:opacity-50"
      style={{ width: index % 2 ? "96%" : "100%", transform: `rotate(${slot.signTilt}deg)` }}
    >
      <span
        className={`flex items-center gap-3.5 rounded-l-lg pl-3.5 pr-12 font-extrabold ${
          compact ? "min-h-[70px] text-[23px]" : "min-h-[76px] text-2xl"
        }`}
        style={{
          background: slot.bg,
          color: slot.fg,
          clipPath: SIGN_CLIP,
          boxShadow: "inset 0 -7px 0 rgba(0,0,0,0.2)",
        }}
      >
        <span
          lang="ne"
          className="flex size-11 shrink-0 items-center justify-center rounded-[10px] text-[26px]"
          style={{ background: slot.badgeBg, color: slot.badgeFg }}
        >
          {slot.letter}
        </span>
        <span className="leading-tight">{label}</span>
      </span>
    </button>
  );
}

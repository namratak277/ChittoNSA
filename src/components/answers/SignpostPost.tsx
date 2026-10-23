import { ANSWER_SLOTS } from "@/lib/answers";
import { SignpostAnswer } from "./SignpostAnswer";

interface SignpostPostProps {
  /** 2–4 answer labels, in क ख ग घ order. */
  options: string[];
  onSelect?: (index: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

/** The wooden post with one trail sign per answer. */
export function SignpostPost({ options, onSelect, disabled, compact }: SignpostPostProps) {
  return (
    <div
      role="group"
      aria-label="Choose your trail"
      className={`relative flex flex-col pl-[22px] ${compact ? "gap-3 pb-4 pt-1.5" : "gap-3.5 pb-6 pt-2"}`}
    >
      <div aria-hidden className="absolute bottom-0 left-1 top-0 w-4 rounded-[3px] border-2 border-ink bg-[#8A6A4F]" />
      {options.slice(0, ANSWER_SLOTS.length).map((label, i) => (
        <SignpostAnswer
          key={i}
          slot={ANSWER_SLOTS[i]}
          label={label}
          index={i}
          onSelect={onSelect ? () => onSelect(i) : undefined}
          disabled={disabled}
          compact={compact}
        />
      ))}
    </div>
  );
}

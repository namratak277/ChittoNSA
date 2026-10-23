import { FLAG } from "@/lib/colors";

interface TimerRingProps {
  /** What to show inside the ring, e.g. 14 or "4:12". */
  value: number | string;
  /** Spoken label, e.g. "14 seconds left". */
  label: string;
  color?: string;
  size?: number;
}

/** Countdown shown as a number inside a thick coloured ring. */
export function TimerRing({ value, label, color = FLAG.red, size = 96 }: TimerRingProps) {
  return (
    <div
      role="timer"
      aria-label={label}
      className="box-border flex shrink-0 items-center justify-center rounded-full font-extrabold tabular-nums"
      style={{ width: size, height: size, border: `8px solid ${color}`, fontSize: Math.round(size * (String(value).length > 2 ? 0.32 : 0.44)) }}
    >
      {value}
    </div>
  );
}

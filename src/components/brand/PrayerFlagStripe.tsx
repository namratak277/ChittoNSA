import { PRAYER_FLAG_ORDER } from "@/lib/teams";

/** 12px blue/white/red/green/yellow stripe across the top of every phone screen. */
export function PrayerFlagStripe({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`grid h-3 shrink-0 grid-cols-5 ${className ?? ""}`}>
      {PRAYER_FLAG_ORDER.map((color) => (
        <div
          key={color}
          style={{ background: color }}
          className={color === "#FFFFFF" ? "border-b-2 border-ink" : undefined}
        />
      ))}
    </div>
  );
}

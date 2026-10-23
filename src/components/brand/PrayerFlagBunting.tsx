import { INK } from "@/lib/colors";
import { PRAYER_FLAG_ORDER } from "@/lib/teams";

// Ten flags on a sagging rope, from the top of design-reference/Main.dc.html.
const FLAGS = [
  { x: 70, y: 20, h: 56 },
  { x: 190, y: 28, h: 56 },
  { x: 310, y: 34, h: 52 },
  { x: 430, y: 38, h: 50 },
  { x: 550, y: 40, h: 48 },
  { x: 682, y: 40, h: 48 },
  { x: 802, y: 38, h: 50 },
  { x: 922, y: 34, h: 52 },
  { x: 1042, y: 28, h: 56 },
  { x: 1162, y: 20, h: 56 },
];

/** Prayer-flag bunting across the top of a 1280-wide host screen. */
export function PrayerFlagBunting({ className }: { className?: string }) {
  return (
    <svg width="1280" height="96" viewBox="0 0 1280 96" aria-hidden className={className}>
      <path d="M0 14 Q640 70 1280 14" fill="none" stroke={INK} strokeWidth="2" />
      {FLAGS.map((f, i) => {
        const color = PRAYER_FLAG_ORDER[i % 5];
        const isWhite = color === "#FFFFFF";
        return (
          <rect
            key={f.x}
            x={f.x}
            y={f.y}
            width="48"
            height={f.h}
            fill={color}
            stroke={isWhite ? INK : undefined}
            strokeWidth={isWhite ? 2 : undefined}
          />
        );
      })}
    </svg>
  );
}

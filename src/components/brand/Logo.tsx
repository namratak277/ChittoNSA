import { BRAND, CLIMBER, INK } from "@/lib/colors";

/** The Topi buddy mascot with speed lines (design-reference/Brand-4.dc.html). */
export function LogoMark({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={(size * 190) / 230} viewBox="0 0 230 190" aria-hidden className={className}>
      <g stroke={INK} strokeWidth="7" strokeLinecap="round">
        <path d="M10 70 H50" />
        <path d="M2 100 H44" />
        <path d="M14 130 H52" />
      </g>
      <circle cx="140" cy="100" r="84" fill={BRAND.marigold} stroke={INK} strokeWidth="6" />
      <path d="M86 184 Q86 132 140 132 Q194 132 194 184 Z" fill={BRAND.chili} stroke={INK} strokeWidth="5" />
      <path d="M104 136 Q140 154 176 136 L176 150 Q140 170 104 150 Z" fill={BRAND.pine} stroke={INK} strokeWidth="4" />
      <circle cx="140" cy="100" r="36" fill="#FFFFFF" stroke={INK} strokeWidth="5" />
      <circle cx="126" cy="98" r="5" fill={INK} />
      <circle cx="154" cy="98" r="5" fill={INK} />
      <circle cx="118" cy="112" r="6" fill={CLIMBER.cheek} opacity="0.7" />
      <circle cx="162" cy="112" r="6" fill={CLIMBER.cheek} opacity="0.7" />
      <path d="M128 112 Q140 124 152 112" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M98 70 L106 30 Q140 18 176 30 L182 70 Z" fill={BRAND.chili} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M114 44 l7 11 l7 -11 l7 11 l7 -11 l7 11 l7 -11 l7 11" fill="none" stroke="#FFFFFF" strokeWidth="4" />
    </svg>
  );
}

/** "Chhito! छिटो!" wordmark. Size is the Latin cap size in px; Nepali scales with it. */
export function Wordmark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-baseline leading-none ${className ?? ""}`} style={{ gap: size * 0.25 }}>
      <span className="font-extrabold" style={{ fontSize: size }}>
        Chhito!
      </span>
      <span lang="ne" className="font-display text-chili" style={{ fontSize: size * 0.62 }}>
        छिटो!
      </span>
    </span>
  );
}

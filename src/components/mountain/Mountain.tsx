import { CHECKPOINTS } from "@/lib/checkpoints";
import { FLAG, GLACIER, INK } from "@/lib/colors";

interface MountainProps {
  /** Show the dashed trail, stops and checkpoint labels. */
  showTrail?: boolean;
  className?: string;
}

const TRAIL = "M" + CHECKPOINTS.map((c) => `${c.stop.x} ${c.stop.y}`).join(" L");

/**
 * The light-glacier Everest drawn for the 1280×720 host stage (design-reference/Mountain.dc.html).
 * The sun sits on the left, the lit side.
 */
export function Mountain({ showTrail = true, className }: MountainProps) {
  const summit = CHECKPOINTS[CHECKPOINTS.length - 1].stop;
  return (
    <svg width="1280" height="720" viewBox="0 0 1280 720" aria-hidden className={className}>
      <circle cx="400" cy="200" r="64" fill={GLACIER.sun} />
      <path d="M0 600 Q200 540 360 580 Q520 548 640 590 Q800 540 960 578 Q1120 548 1280 584 L1280 720 L0 720 Z" fill={GLACIER.haze} />
      <path d="M180 640 L300 540 L380 500 L470 380 L540 300 L600 190 L640 130 L690 200 L760 290 L820 360 L900 430 L980 520 L1100 640 Z" fill={GLACIER.lit} />
      <path d="M470 380 L520 430 L496 520 L444 640 L340 640 L414 520 Z" fill={GLACIER.litSide} />
      <path d="M640 130 L690 200 L760 290 L820 360 L900 430 L980 520 L1100 640 L780 640 L742 520 L702 400 L668 260 Z" fill={GLACIER.shadow} />
      <path d="M820 360 L860 440 L840 540 L880 640 L960 640 L920 540 L940 470 Z" fill={GLACIER.fold} />
      <g fill="none" strokeLinecap="round" strokeWidth="3">
        <path d="M706 330 L756 352" stroke={GLACIER.crevasse} />
        <path d="M720 380 L800 410" stroke={GLACIER.crevasse} />
        <path d="M744 460 L840 486" stroke={GLACIER.crevasse} />
        <path d="M770 560 L880 576" stroke={GLACIER.crevasse} />
        <path d="M520 360 L470 420" stroke={GLACIER.highlight} />
        <path d="M600 420 L540 520" stroke={GLACIER.highlight} />
        <path d="M380 560 L330 610" stroke={GLACIER.highlight} />
      </g>
      <path d="M579 228 L600 190 L640 130 L668 260 L652 244 L640 268 L622 240 L604 256 Z" fill="#FFFFFF" />
      <path d="M640 130 L690 200 L706 234 L690 250 L678 236 L668 260 Z" fill="#E2ECFC" />
      <path d="M622 300 L652 288 L664 360 L644 430 L630 362 Z" fill="#EEF4FE" />
      <path d="M540 300 L562 292 L552 326 Z" fill="#FFFFFF" />
      <path d="M760 290 L778 312 L748 318 Z" fill="#E2ECFC" />
      <path d="M470 380 L492 376 L478 404 Z" fill="#FFFFFF" />
      <g fill="#FFFFFF" opacity="0.92">
        <ellipse cx="300" cy="470" rx="60" ry="18" />
        <ellipse cx="340" cy="458" rx="40" ry="20" />
        <ellipse cx="990" cy="460" rx="64" ry="18" />
        <ellipse cx="950" cy="448" rx="38" ry="18" />
      </g>
      <path d="M0 720 L0 628 Q160 588 300 632 Q460 604 640 652 Q820 604 980 632 Q1120 594 1280 624 L1280 720 Z" fill={GLACIER.foothill} />
      <g fill={GLACIER.foothillTrees}>
        <path d="M90 628 L104 596 L118 628 Z" />
        <path d="M120 624 L136 586 L152 624 Z" />
        <path d="M206 624 L220 594 L234 624 Z" />
        <path d="M1040 622 L1056 586 L1072 622 Z" />
        <path d="M1076 620 L1090 592 L1104 620 Z" />
        <path d="M1180 624 L1196 588 L1212 624 Z" />
      </g>

      {/* Summit pole with prayer flags */}
      <path d={`M${summit.x} ${summit.y} L${summit.x} 104`} stroke={INK} strokeWidth="3" />
      <rect x="641" y="104" width="14" height="12" fill={FLAG.blue} />
      <rect x="655" y="108" width="14" height="12" fill="#FFFFFF" stroke={INK} strokeWidth="1.5" />
      <rect x="669" y="112" width="14" height="12" fill={FLAG.red} />
      <rect x="683" y="116" width="14" height="12" fill={FLAG.green} />
      <rect x="697" y="120" width="14" height="12" fill={FLAG.yellow} />

      {showTrail && (
        <>
          <path d={TRAIL} fill="none" stroke={GLACIER.trail} strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
          {CHECKPOINTS.map((c) =>
            c.order === 5 ? (
              <circle key={c.order} cx={c.stop.x} cy={c.stop.y} r="9" fill={FLAG.red} stroke={INK} strokeWidth="3" />
            ) : (
              <circle key={c.order} cx={c.stop.x} cy={c.stop.y} r="8" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
            ),
          )}
          <g
            fontSize="17"
            fontWeight="800"
            fill={INK}
            stroke="#FFFFFF"
            strokeWidth="5"
            paintOrder="stroke"
            strokeLinejoin="round"
            textAnchor="end"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            {CHECKPOINTS.map((c) => (
              <text key={c.order} x={c.label.x} y={c.label.y}>
                {c.order} · {c.name}
                {c.order === 5 ? " · 8,849 m" : ""}
              </text>
            ))}
          </g>
        </>
      )}
    </svg>
  );
}

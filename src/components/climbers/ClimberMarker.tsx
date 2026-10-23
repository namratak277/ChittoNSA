import { CLIMBER, INK, PAGE } from "@/lib/colors";
import type { Team } from "@/lib/teams";

export type ClimberStyle = "topi" | "headlamp";

interface ClimberMarkerProps {
  style: ClimberStyle;
  team: Team;
  size?: number;
  /** Accessible name. Omit when the marker is decorative (e.g. next to the team name). */
  label?: string;
  className?: string;
}

// Drawings copied from design-reference/Player-Markers.dc.html (48×48 viewBox).
export function ClimberMarker({ style, team, size = 48, label, className }: ClimberMarkerProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} style={{ display: "block" }} {...a11y}>
      {style === "topi" ? <Topi team={team} /> : <Headlamp team={team} />}
    </svg>
  );
}

function Topi({ team }: { team: Team }) {
  return (
    <>
      <circle cx="24" cy="24" r="23" fill={CLIMBER.topiBg} stroke={INK} strokeWidth="2" />
      <path d="M11 46 Q11 31 24 31 Q37 31 37 46 Z" fill={team.color} stroke={INK} strokeWidth="2" />
      <path d="M16 32 Q24 37 32 32 L32 36 Q24 41 16 36 Z" fill={team.scarf} stroke={INK} strokeWidth="1.5" />
      <circle cx="24" cy="23" r="9" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
      <circle cx="20.5" cy="23" r="1.6" fill={INK} />
      <circle cx="27.5" cy="23" r="1.6" fill={INK} />
      <circle cx="18.3" cy="27.6" r="1.8" fill={CLIMBER.cheek} opacity="0.65" />
      <circle cx="29.7" cy="27.6" r="1.8" fill={CLIMBER.cheek} opacity="0.65" />
      <path d="M21 28.2 Q24 30.8 27 28.2" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 16 L16 7 Q24 4 33 7 L34 16 Z" fill={team.color} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 10 l2 3 l2 -3 l2 3 l2 -3 l2 3 l2 -3" fill="none" stroke={team.topiPattern} strokeWidth="1.5" />
    </>
  );
}

function Headlamp({ team }: { team: Team }) {
  return (
    <>
      <circle cx="24" cy="24" r="23" fill={CLIMBER.night} stroke={INK} strokeWidth="2" />
      <path d="M24 15 L4 5 L2 17 Z" fill={CLIMBER.lamp} opacity="0.85" />
      <circle cx="38" cy="9" r="1.2" fill="#FFFFFF" />
      <circle cx="33" cy="5" r="0.9" fill="#FFFFFF" />
      <path d="M11 46 Q11 31 24 31 Q37 31 37 46 Z" fill={team.color} stroke={INK} strokeWidth="2" />
      <circle cx="24" cy="23" r="8" fill={PAGE} stroke={INK} strokeWidth="2" />
      <rect x="16.5" y="21" width="15" height="5" rx="2.5" fill={INK} />
      <path d="M15 21 Q15 11 24 11 Q33 11 33 21 Z" fill={team.color} stroke={INK} strokeWidth="2" />
      <circle cx="24" cy="15.5" r="2.6" fill={CLIMBER.lamp} stroke={INK} strokeWidth="1.2" />
    </>
  );
}

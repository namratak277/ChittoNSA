import type { Team } from "@/lib/teams";

export type AwardReason = "plan" | "reasoning" | "backup" | "teamwork";

const AWARDS: { reason: AwardReason; label: string; points: number; aria: string }[] = [
  { reason: "plan", label: "+10 plan", points: 10, aria: "a practical plan" },
  { reason: "reasoning", label: "+5 why", points: 5, aria: "explaining their reasoning" },
  { reason: "backup", label: "+5 backup", points: 5, aria: "a backup plan" },
  { reason: "teamwork", label: "+5 team", points: 5, aria: "teamwork" },
];

interface ScorecardProps {
  /** `key` identifies the team to onAward (the team row id in a live game). */
  teams: { key: string; team: Team }[];
  /** Points awarded to each team this round, by key. */
  awarded: Record<string, number>;
  onAward: (key: string, reason: AwardReason, points: number) => void;
  onReset: () => void;
  busy?: boolean;
  className?: string;
}

/** Host scorecard: tap to award points for plans, reasoning, backups and teamwork. */
export function Scorecard({ teams, awarded, onAward, onReset, busy = false, className = "" }: ScorecardProps) {
  return (
    <div className={`flex flex-col gap-1.5 rounded-[20px] border-[3px] border-ink bg-white px-[18px] py-3 ${className}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[19px] font-extrabold">Host scorecard</span>
        <span className="text-[13px] text-body">tap to award</span>
      </div>
      <ul className="flex flex-col gap-1">
        {teams.map(({ key, team }) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className="size-3.5 shrink-0 rounded border-2 border-ink" style={{ background: team.color }} aria-hidden />
            <span className="min-w-0 grow text-sm font-bold leading-tight">{team.name}</span>
            {AWARDS.map((a) => (
              <button
                key={a.reason}
                type="button"
                disabled={busy}
                onClick={() => onAward(key, a.reason, a.points)}
                aria-label={`Award ${team.name} ${a.points} points for ${a.aria}`}
                className="min-h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-lg border-2 border-ink bg-cream px-1 text-xs font-extrabold disabled:opacity-60"
              >
                {a.label}
              </button>
            ))}
            <b className="w-[34px] text-right text-[17px]" aria-live="polite">
              +{awarded[key] ?? 0}
            </b>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onReset}
        disabled={busy}
        className="min-h-8 cursor-pointer self-start rounded-lg border-0 bg-transparent px-2.5 text-[13px] underline"
      >
        Reset this round
      </button>
    </div>
  );
}

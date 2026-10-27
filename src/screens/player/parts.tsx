import { CHECKPOINTS } from "@/lib/checkpoints";
import { LOCAL, NC_VOTING_LINKS, OFFICIAL_LINKS } from "@/lib/settings";

const linkClass = "flex min-h-12 items-center justify-between gap-2 rounded-[14px] border-[3px] border-flag-blue bg-white px-4 text-[17px] font-extrabold text-flag-blue no-underline";

/** Official voting tools only: NC State Board of Elections for every NC county, vote.gov for other states. */
export function VotingLinks({ limit = NC_VOTING_LINKS.length }: { limit?: number }) {
  return (
    <section aria-label="Official voting info" className="flex flex-col gap-2">
      <p className="text-base font-extrabold">
        Voting in North Carolina <span className="font-medium text-body">(in {LOCAL.city}, that&apos;s {LOCAL.county})</span>
      </p>
      <ul className="flex flex-col gap-2">
        {NC_VOTING_LINKS.slice(0, limit).map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {l.label}
              <span className="text-sm font-bold">ncsbe.gov ↗</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[15px] leading-snug text-body">
        Registered in another state?{" "}
        <a href={OFFICIAL_LINKS.voteGov.href} target="_blank" rel="noopener noreferrer" className="font-bold text-flag-blue">
          vote.gov
        </a>{" "}
        has every state&apos;s official info.
      </p>
    </section>
  );
}

const SHORT_NAMES = ["Base Camp", "Route", "Storm Zone", "Final Ascent", "Summit"];

/** Five-step Base → Summit progress bar at the top of the answer screens. */
export function CampProgress({ checkpoint }: { checkpoint: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[15px] font-bold">
        <span>Base</span>
        <span>{SHORT_NAMES[checkpoint]}</span>
        <span>Summit</span>
      </div>
      <div
        role="progressbar"
        aria-label="Your team's climb"
        aria-valuemin={1}
        aria-valuemax={CHECKPOINTS.length}
        aria-valuenow={checkpoint + 1}
        aria-valuetext={CHECKPOINTS[checkpoint].name}
        className="grid grid-cols-5 gap-1"
      >
        {CHECKPOINTS.map((c, i) => (
          <div
            key={c.order}
            className={`h-3.5 rounded border-2 border-ink ${i <= checkpoint ? (i === 4 ? "bg-flag-red" : "bg-ink") : "bg-white"}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Big "+10 for your team" / "Not this time" card. */
export function ResultCard({ correct, headline, subline }: { correct: boolean; headline: string; subline: string }) {
  return (
    <div
      role="status"
      className={`flex flex-col gap-1.5 rounded-[18px] p-5 ${correct ? "bg-flag-green-dark text-white" : "border-[3px] border-ink bg-danger-bg text-ink"}`}
    >
      <p className="text-[32px] font-extrabold leading-[1.05]">{headline}</p>
      <p className="text-lg leading-snug">{subline}</p>
    </div>
  );
}

export function TrailFact({ title = "TRAIL FACT", children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[18px] border-[3px] border-ink bg-white p-[18px]">
      <p className="text-sm font-bold tracking-[1px] text-flag-red">{title}</p>
      <p className="text-lg leading-snug">{children}</p>
    </div>
  );
}

/** Small red label above a phone screen title, e.g. "CHECKPOINT 2 · THE ROUTE". */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm font-extrabold tracking-[1px] text-flag-red ${className ?? ""}`}>{children}</p>;
}

import { ClimberMarker } from "@/components/climbers/ClimberMarker";
import { Mountain } from "@/components/mountain/Mountain";
import { FLAG } from "@/lib/colors";
import { ranked, type DemoTeam } from "@/lib/demo";
import { SETTINGS } from "@/lib/settings";

interface HostSummitProps {
  teams: DemoTeam[];
  onPlanVote: () => void;
}

/** Summit Champions (design-reference/Host-Summit.dc.html). */
export function HostSummit({ teams, onPlanVote }: HostSummitProps) {
  const order = ranked(teams);
  const winner = order[0];
  const climbers = teams.reduce((n, t) => n + t.members, 0);
  const totalPoints = teams.reduce((n, t) => n + t.points, 0);

  return (
    <>
      <Mountain showTrail={false} className="absolute inset-0" />
      <svg width="1280" height="720" viewBox="0 0 1280 720" aria-hidden className="absolute inset-0">
        <g stroke={FLAG.yellow} strokeWidth="4" strokeLinecap="round">
          <path d="M560 110 L540 96" />
          <path d="M720 130 L744 120" />
          <path d="M590 70 L580 50" />
          <path d="M760 70 L776 54" />
        </g>
      </svg>
      <div className="absolute left-[606px] top-[120px]">
        <ClimberMarker style={winner.style} team={winner.team} size={64} label={`${winner.team.name} at the summit`} />
      </div>

      <div className="absolute left-16 top-10 flex w-[440px] flex-col gap-1.5">
        <p className="text-[22px] font-bold text-flag-red">
          <span lang="ne">शिखर!</span> Summit reached
        </p>
        <h1 className="text-[56px] font-extrabold leading-none">{winner.team.name} plant the flag!</h1>
      </div>

      <div className="absolute left-16 top-[260px] flex w-[300px] flex-col gap-2.5">
        <ol className="flex flex-col gap-2.5">
          {order.slice(0, 3).map(({ team, points }, i) => (
            <li
              key={team.id}
              className={`flex items-center gap-3 rounded-2xl border-[3px] border-ink px-4 py-3 text-xl font-extrabold ${i === 0 ? "bg-marigold" : "bg-white"}`}
            >
              <span className="text-[26px]">{i + 1}</span>
              <span className="grow">{team.name}</span>
              <span>{points}</span>
            </li>
          ))}
        </ol>
        <p className="text-[17px] text-body">Summit Champions win {SETTINGS.prize}</p>
      </div>

      <div className="absolute right-16 top-[260px] flex w-[300px] flex-col gap-2.5 rounded-[20px] border-[3px] border-ink bg-white p-5">
        <p className="text-xl font-extrabold">Today&apos;s expedition</p>
        <dl className="flex flex-col gap-2.5 text-lg">
          <div className="flex justify-between">
            <dt>Teams · climbers</dt>
            <dd className="font-bold">
              {teams.length} · {climbers}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Points earned</dt>
            <dd className="font-bold">{totalPoints}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Checkpoints climbed</dt>
            <dd className="font-bold">5</dd>
          </div>
        </dl>
      </div>

      <div className="absolute inset-x-16 bottom-7 flex items-center gap-4 rounded-[20px] bg-ink px-6 py-4 text-white">
        <p className="grow text-[22px] leading-snug">
          <b>Your next summit: Election Day.</b> Check your registration at vote.gov — deadline {SETTINGS.registrationDeadline}.
        </p>
        <button
          type="button"
          onClick={onPlanVote}
          className="min-h-[52px] shrink-0 cursor-pointer rounded-[14px] border-0 bg-flag-red px-6 text-xl font-extrabold text-white"
        >
          Plan your vote →
        </button>
      </div>
    </>
  );
}

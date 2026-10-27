import { TimerRing } from "@/components/ui/TimerRing";
import { BRAND, FLAG, INK } from "@/lib/colors";
import { SUPPLIES, SUPPLY_BUDGET } from "@/lib/supplies";
import type { Team } from "@/lib/teams";

interface HostSuppliesProps {
  teams: { team: Team; supplySpent: number; packed: boolean }[];
  timeLeft: string;
  /** The first question, shown as what comes next. */
  nextQuestion?: string;
  onClose: () => void;
  busy?: boolean;
}

/** Checkpoint 1: Build your expedition (design-reference/Host-Supplies.dc.html). */
export function HostSupplies({ teams, timeLeft, nextQuestion = "Before Election Day, what should you check first?", onClose, busy = false }: HostSuppliesProps) {
  return (
    <>
      <svg width="1280" height="720" viewBox="0 0 1280 720" aria-hidden className="absolute inset-0">
        <circle cx="150" cy="120" r="54" fill="#FFF1C2" />
        <path d="M0 720 L0 600 Q200 560 360 590 Q520 556 680 596 L680 720 Z" fill="#E3EDFC" />
        <path d="M0 720 L0 650 Q160 620 320 652 Q480 628 680 660 L680 720 Z" fill="#8FB2EF" />
        <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M90 660 L130 600 L170 660 Z" fill={BRAND.chili} />
          <path d="M130 600 L130 660" fill="none" />
          <path d="M190 664 L226 610 L262 664 Z" fill={FLAG.yellow} />
          <path d="M226 610 L226 664" fill="none" />
          <path d="M290 666 L322 618 L354 666 Z" fill={FLAG.green} />
          <path d="M322 618 L322 666" fill="none" />
        </g>
      </svg>

      <div className="absolute left-14 top-9 flex w-160 flex-col gap-2">
        <p className="text-[17px] font-extrabold tracking-[1px] text-chili">CHECKPOINT 1 · BASE CAMP</p>
        <h1 className="text-[54px] font-extrabold leading-none">Build your expedition</h1>
        <p className="text-xl leading-snug text-body">
          Every team has <b>10 supply points</b>. You can&apos;t take everything, so pick what your team will need on the climb.
          Your choices matter at later checkpoints.
        </p>
      </div>

      <ul className="absolute left-14 top-[228px] grid w-160 grid-cols-3 gap-3">
        {SUPPLIES.map((s) => (
          <li key={s.id} className="flex flex-col gap-0.5 rounded-2xl border-[3px] border-ink bg-white px-3.5 py-3">
            <div className="flex items-baseline justify-between">
              <b className="text-xl">{s.name}</b>
              <span className="rounded-full bg-ink px-2.5 font-extrabold text-marigold" aria-label={`${s.cost} points`}>
                {s.cost}
              </span>
            </div>
            <span className="text-[15px] text-body">{s.helps}</span>
          </li>
        ))}
      </ul>

      <div className="absolute left-14 top-[452px] flex w-160 flex-col gap-1 rounded-2xl bg-ink px-[18px] py-3.5 text-cream">
        <p className="text-sm font-extrabold tracking-[1px] text-marigold">THEN · BASE CAMP QUESTION</p>
        <p className="text-[22px] font-extrabold leading-tight">{nextQuestion}</p>
        <p className="text-[15px] text-[#D9D6E4]">Teams that packed well (8+ points used) and answer right earn a +5 supply token.</p>
      </div>

      <div className="absolute right-12 top-9 flex w-[470px] flex-col gap-3.5">
        <div className="flex items-center gap-[18px] rounded-[20px] border-[3px] border-ink bg-white px-5 py-4">
          <TimerRing value={timeLeft} label={`${timeLeft} left to shop`} color={BRAND.chili} size={84} />
          <p className="text-lg leading-snug">
            <b>Shop is open</b>
            <br />
            Talk it over and lock in your supplies on one team phone.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 rounded-[20px] border-[3px] border-ink bg-white px-5 py-4">
          <p className="text-xl font-extrabold">Team packs</p>
          <ul className="flex flex-col gap-2.5">
            {teams.map(({ team, supplySpent, packed }) => (
              <li key={team.id} className="flex items-center gap-2.5 text-[17px]">
                <span className="size-3.5 rounded border-2 border-ink" style={{ background: team.color }} aria-hidden />
                <span className="grow">{team.name}</span>
                {packed ? (
                  <b className="text-flag-green-dark">
                    Packed · {supplySpent}/{SUPPLY_BUDGET}
                  </b>
                ) : (
                  <span>
                    choosing… {supplySpent}/{SUPPLY_BUDGET}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="min-h-14 cursor-pointer rounded-2xl border-0 bg-flag-red text-[21px] font-extrabold text-white disabled:opacity-60"
        >
          Close shop → Base Camp question
        </button>
      </div>
    </>
  );
}

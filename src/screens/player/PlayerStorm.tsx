import { FLAG, INK } from "@/lib/colors";
import type { PublicCard } from "@/lib/db";
import { SUPPLIES, type SupplyId } from "@/lib/supplies";
import { Eyebrow } from "./parts";

interface PlayerStormProps {
  card: PublicCard;
  /** What this team packed at Base Camp. */
  supplies: SupplyId[];
  secondsLeft: number | null;
}

/** Checkpoint 3 on the phone: the storm card, the team's supplies, and the planning clock. */
export function PlayerStorm({ card, supplies, secondsLeft }: PlayerStormProps) {
  const helpful = card.helpful_supply ? SUPPLIES.find((s) => s.id === card.helpful_supply) : undefined;
  const packedIt = helpful && supplies.includes(helpful.id);
  const clock = secondsLeft === null ? null : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <>
      <div>
        <Eyebrow className="text-danger">CHECKPOINT 3 · THE STORM ZONE</Eyebrow>
        <h1 className="text-[30px] font-extrabold leading-[1.05]">Surprise event!</h1>
      </div>
      <div className="flex flex-col gap-2 rounded-[18px] border-[3px] border-ink bg-white p-[18px] shadow-ink">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 3 L22 20 H2 Z" fill={FLAG.yellow} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 9 V14" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1.3" fill={INK} />
          </svg>
          <span className="text-sm font-extrabold tracking-[1px]">
            EVENT CARD {card.number} OF {card.total}
          </span>
        </div>
        <p className="text-2xl font-extrabold leading-tight">{card.title}</p>
        <p className="text-lg leading-snug text-[#3A3550]">{card.body}</p>
      </div>
      {helpful && packedIt && (
        <p role="status" className="rounded-[14px] bg-flag-green-dark px-4 py-3 text-lg font-extrabold text-white">
          Your {helpful.name.toLowerCase()} helped! +5 for your team.
        </p>
      )}
      <div className="flex items-center justify-between rounded-[14px] bg-ink px-4 py-3 text-white" role="timer" aria-label={clock ? `${clock} left to plan` : undefined}>
        <span className="text-lg font-extrabold">Talk it through</span>
        {clock && <span className="text-xl font-extrabold tabular-nums">{secondsLeft === 0 ? "Time!" : clock}</span>}
      </div>
      <p className="text-base leading-snug text-body">
        Make a practical plan and a backup. Then one person explains it to the host. Your pack:{" "}
        <b className="text-ink">{supplies.map((id) => SUPPLIES.find((s) => s.id === id)?.name).join(" · ") || "nothing packed"}</b>
      </p>
    </>
  );
}

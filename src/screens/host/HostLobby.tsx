"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useSyncExternalStore } from "react";
import { PrayerFlagBunting } from "@/components/brand/PrayerFlagBunting";
import { FLAG, INK } from "@/lib/colors";
import { formatPin } from "@/lib/demo";
import type { Team } from "@/lib/teams";
import { useSettings } from "@/lib/useSettings";

const noSubscribe = () => () => {};
/** This site's address, e.g. "https://chhito.vercel.app" (empty while prerendering). */
const useOrigin = () => useSyncExternalStore(noSubscribe, () => location.origin, () => "");
const isPlaceholder = (value: string) => value.startsWith("[");

const RULES = [
  {
    tab: "Join",
    title: "Pick your team by flag colour",
    body: "Scan the QR code or enter the PIN. Your flag colour is your team: {teams}.",
    color: FLAG.blue,
  },
  {
    tab: "Pack",
    title: "Build your expedition",
    body: "Each team gets 10 supply points to spend on maps, warm layers, food and emergency gear. What you pack matters later on the mountain.",
    color: FLAG.red,
  },
  {
    tab: "Climb",
    title: "Four checkpoints, one goal",
    body: "Base Camp → Route Checkpoint → Storm Zone → Final Ascent → Summit. Answer, decide together and explain your thinking. Points move your team up. Nobody gets knocked out.",
    color: FLAG.green,
  },
  {
    tab: "Storm",
    title: "Expect the unexpected",
    body: "Surprise event cards hit at the Storm Zone. The best practical plan wins the points, not the fastest answer.",
    color: "#B07F00",
  },
  {
    tab: "Summit",
    title: "From the summit to the ballot",
    body: "The team with the most points becomes Summit Champions and wins {prize}. Then everyone makes their own voting plan. You planned your climb, now plan your vote.",
    color: INK,
  },
];

interface HostLobbyProps {
  pin: string;
  teams: { team: Team; members: number }[];
  onStart: () => void;
  /** Disables Start (e.g. while the state change is saving). */
  starting?: boolean;
}

/** Welcome to Base Camp (design-reference/Main.dc.html). */
export function HostLobby({ pin, teams, onStart, starting = false }: HostLobbyProps) {
  const origin = useOrigin();
  const settings = useSettings();
  // Players type the club's short address if the host set one; the QR code always goes straight to this PIN.
  const joinAddress = isPlaceholder(settings.gameUrl) ? origin.replace(/^https?:\/\//, "") + "/play" : settings.gameUrl;
  const [step, setStep] = useState(0);
  const rule = RULES[step];
  const names = teams.map((t) => t.team.name);
  const teamList = names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names.at(-1)}` : (names[0] ?? "");
  const climbers = teams.reduce((n, t) => n + t.members, 0);
  const go = (n: number) => setStep((n + RULES.length) % RULES.length);

  return (
    <>
      <svg width="1280" height="720" viewBox="0 0 1280 720" aria-hidden className="absolute inset-0">
        <path d="M380 720 L560 560 L660 480 L740 380 L800 310 L840 250 L880 310 L950 390 L1040 480 L1150 570 L1280 650 L1280 720 Z" fill="#DCE7FA" />
        <path d="M840 250 L880 310 L950 390 L1040 480 L1150 570 L1280 650 L1280 720 L980 720 L930 560 L880 400 Z" fill="#C7D9F7" />
        <path d="M812 290 L840 250 L866 290 L852 284 L840 300 L826 284 Z" fill="#FFFFFF" />
        <path d="M330 690 L360 650 L390 690 Z" fill={FLAG.red} />
        <path d="M400 690 L425 656 L450 690 Z" fill={FLAG.blue} />
      </svg>
      <PrayerFlagBunting className="absolute left-0 top-0" />

      <div className="absolute left-16 top-[104px] flex w-[760px] flex-col gap-3.5">
        <p className="text-[26px] font-bold text-flag-red">
          <span lang="ne">नमस्ते!</span> Chhito! · Think fast. Climb fast. Vote.
        </p>
        <h1 className="-mt-2 text-[64px] font-extrabold leading-none">Welcome to Base Camp!</h1>
        <p className="max-w-[620px] text-[22px] leading-snug text-body">
          Answer questions about Nepal and voting to climb the mountain. The team with the most points wins.
        </p>
        <div className="mt-1.5 flex flex-wrap gap-2" role="tablist" aria-label="Rules">
          {RULES.map((r, i) => (
            <button
              key={r.tab}
              type="button"
              role="tab"
              aria-selected={i === step}
              onClick={() => setStep(i)}
              className={`min-h-11 cursor-pointer rounded-full border-2 border-ink px-4 text-lg font-bold ${
                i === step ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              {i + 1} · {r.tab}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="flex min-h-[150px] items-start gap-5 rounded-[20px] border-[3px] border-ink bg-white px-[26px] py-[22px]">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full text-[28px] font-extrabold text-white"
            style={{ background: rule.color }}
          >
            {step + 1}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[28px] font-extrabold leading-tight">{rule.title}</p>
            <p className="text-xl leading-snug text-body">{rule.body.replace("{prize}", settings.prize).replace("{teams}", teamList)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => go(step - 1)} className="min-h-12 cursor-pointer rounded-[14px] border-2 border-ink bg-white px-5 text-lg font-bold">
            Back
          </button>
          <button type="button" onClick={() => go(step + 1)} className="min-h-12 cursor-pointer rounded-[14px] border-2 border-ink bg-white px-5 text-lg font-bold">
            Next rule
          </button>
        </div>
      </div>

      <div className="absolute right-16 top-[100px] flex w-80 flex-col gap-3">
        <div className="flex flex-col items-center gap-1.5 rounded-3xl border-[3px] border-ink bg-white p-4">
          <div className="flex size-[132px] items-center justify-center">
            {origin && <QRCodeSVG value={`${origin}/play/${pin}`} size={132} fgColor={INK} title={`Scan to join game ${pin}`} />}
          </div>
          <p className="text-center text-base text-body">
            or go to <b className="text-ink">{joinAddress}</b> · Game PIN
          </p>
          <p className="text-[44px] font-extrabold leading-none tracking-[4px]">{formatPin(pin)}</p>
        </div>
        <p className="text-lg font-bold">
          {teams.length} teams · {climbers} climbers at Base Camp
        </p>
        <ul className="grid grid-cols-2 gap-1.5">
          {teams.map(({ team, members }) => (
            <li
              key={team.id}
              className={`whitespace-nowrap rounded-[10px] px-2 py-1 text-[13px] font-bold ${team.id === "white" ? "border-2 border-ink" : ""}`}
              style={{ background: team.tint }}
            >
              {team.name} · {members}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          className="flex min-h-[60px] cursor-pointer items-center justify-center gap-2.5 rounded-[18px] border-0 bg-flag-red text-2xl font-extrabold text-white disabled:opacity-60"
        >
          Start the climb
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path d="M5 12 H19 M13 6 L19 12 L13 18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
}

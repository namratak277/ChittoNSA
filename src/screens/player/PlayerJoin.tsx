"use client";

import { useState } from "react";
import { ClimberMarker, type ClimberStyle } from "@/components/climbers/ClimberMarker";
import type { Team } from "@/lib/teams";

export interface JoinDetails {
  pin: string;
  nickname: string;
  team: Team;
  style: ClimberStyle;
}

interface PlayerJoinProps {
  initialPin: string;
  teams: Team[];
  onJoin: (details: JoinDetails) => void;
}

const inputClass = "h-14 w-full rounded-[14px] border-[3px] border-ink bg-white px-4";

/** Join with PIN, nickname, team flag colour and climber (design-reference/C-Phone.dc.html). */
export function PlayerJoin({ initialPin, teams, onJoin }: PlayerJoinProps) {
  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState("");
  const [teamIndex, setTeamIndex] = useState(0);
  const [style, setStyle] = useState<ClimberStyle>("topi");
  const [error, setError] = useState("");
  const team = teams[teamIndex];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = pin.replace(/\D/g, "");
    if (digits.length !== 6) return setError("The game PIN has 6 numbers. Check the big screen.");
    if (!nickname.trim()) return setError("Pick a nickname so your team knows it's you.");
    setError("");
    onJoin({ pin: digits, nickname: nickname.trim(), team, style });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-3.5">
      <div>
        <p lang="ne" className="text-[22px] font-bold text-flag-red">
          नमस्ते!
        </p>
        <h1 className="text-[40px] font-extrabold leading-[1.05]">
          Chhito!{" "}
          <span lang="ne" className="text-chili">
            छिटो!
          </span>
        </h1>
        <p className="mt-1 text-base text-body">No account needed — just the game PIN.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pin" className="text-[17px] font-bold">
          Game PIN
        </label>
        <input
          id="pin"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className={`${inputClass} text-[26px] font-extrabold tracking-[3px]`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nick" className="text-[17px] font-bold">
          Nickname
        </label>
        <input
          id="nick"
          autoComplete="nickname"
          maxLength={20}
          placeholder="e.g. Momo Master"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className={`${inputClass} text-xl`}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[17px] font-bold">Pick your team (flag colour)</legend>
        <div className="flex flex-wrap gap-3">
          {teams.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={i === teamIndex}
              aria-label={`${t.name}, ${t.id} flag`}
              onClick={() => setTeamIndex(i)}
              className={`flex size-12 cursor-pointer items-center justify-center rounded-xl text-xl font-extrabold ${
                i === teamIndex ? "border-4 border-ink" : "border-2 border-ink"
              }`}
              style={{ background: t.color, color: t.topiPattern }}
            >
              {i === teamIndex ? "✓" : ""}
            </button>
          ))}
        </div>
        <p className="text-[15px] text-body">
          <b className="text-ink">{team.name}</b>
          {team.meaning ? ` · ${team.meaning}` : ""}
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[17px] font-bold">Pick your climber</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["topi", "headlamp"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={style === s}
              onClick={() => setStyle(s)}
              className={`flex min-h-[104px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[14px] text-base font-extrabold text-ink ${
                style === s ? "border-4 border-ink bg-white" : "border-2 border-quiet bg-[#FBFAF6]"
              }`}
            >
              <ClimberMarker style={s} team={team} size={64} />
              {s === "topi" ? "Topi buddy" : "Headlamp"}
            </button>
          ))}
        </div>
      </fieldset>

      <p role="alert" className="min-h-5 text-[15px] font-bold text-danger">
        {error}
      </p>
      <button type="submit" className="mt-auto min-h-[60px] cursor-pointer rounded-2xl border-0 bg-flag-red text-2xl font-extrabold text-white">
        Join game
      </button>
    </form>
  );
}

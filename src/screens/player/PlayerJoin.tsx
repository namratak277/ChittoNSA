"use client";

import { useState } from "react";
import { ClimberMarker, type ClimberStyle } from "@/components/climbers/ClimberMarker";
import { formatPin } from "@/lib/format";
import type { Team } from "@/lib/teams";

export interface JoinDetails {
  pin: string;
  nickname: string;
  team: Team;
  style: ClimberStyle;
}

interface PlayerJoinProps {
  initialPin: string;
  /** Teams playing in the game with this PIN (or the default five before it's found). */
  teams: Team[];
  /** Called with the PIN digits as they're typed, so the teams can be looked up. */
  onPinChange?: (digits: string) => void;
  /** Note under the PIN, e.g. "No game with that PIN". */
  pinNote?: string;
  /** Resolves to an error message if joining failed. */
  onJoin: (details: JoinDetails) => Promise<string | void> | void;
}

const inputClass = "h-14 w-full rounded-[14px] border-[3px] border-ink bg-white px-4";

/** Join with PIN, nickname, team flag colour and climber (design-reference/C-Phone.dc.html). */
export function PlayerJoin({ initialPin, teams, onPinChange, pinNote, onJoin }: PlayerJoinProps) {
  const [pin, setPin] = useState(initialPin);
  // Arrived from the QR code: the game is already chosen, so the PIN box stays hidden unless it's wrong.
  const [editPin, setEditPin] = useState(initialPin.replace(/\D/g, "").length !== 6);
  const showPin = editPin || Boolean(pinNote);
  const [nickname, setNickname] = useState("");
  const [teamIndex, setTeamIndex] = useState(0);
  const [style, setStyle] = useState<ClimberStyle>("topi");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const team = teams[Math.min(teamIndex, teams.length - 1)];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = pin.replace(/\D/g, "");
    if (digits.length !== 6) return setError("The game PIN has 6 numbers. Check the big screen.");
    if (!nickname.trim()) return setError("Pick a nickname so your team knows it's you.");
    setError("");
    setBusy(true);
    const failed = await onJoin({ pin: digits, nickname: nickname.trim(), team, style });
    setBusy(false);
    if (failed) setError(failed);
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
        <p className="mt-1 text-base text-body">
          {showPin ? "No account needed — just the game PIN." : "No account needed. Pick a nickname and your team to join."}
        </p>
      </div>

      {!showPin && (
        <div className="flex items-center justify-between gap-3 rounded-[14px] border-2 border-ink bg-white px-4 py-2">
          <p className="text-[17px]">
            Joining game <b className="tracking-[2px]">{formatPin(pin)}</b>
          </p>
          <button type="button" onClick={() => setEditPin(true)} className="min-h-11 cursor-pointer px-1 text-base font-bold text-flag-blue underline">
            Change
          </button>
        </div>
      )}

      <div className={showPin ? "flex flex-col gap-1.5" : "hidden"}>
        <label htmlFor="pin" className="text-[17px] font-bold">
          Game PIN
        </label>
        <input
          id="pin"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            onPinChange?.(e.target.value.replace(/\D/g, ""));
          }}
          aria-describedby={pinNote ? "pin-note" : undefined}
          className={`${inputClass} text-[26px] font-extrabold tracking-[3px]`}
        />
        {pinNote && (
          <p id="pin-note" className="text-[15px] font-bold text-danger">
            {pinNote}
          </p>
        )}
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
              aria-pressed={t.id === team.id}
              aria-label={`${t.name}, ${t.id} flag`}
              onClick={() => setTeamIndex(i)}
              className={`flex size-12 cursor-pointer items-center justify-center rounded-xl text-xl font-extrabold ${
                t.id === team.id ? "border-4 border-ink" : "border-2 border-ink"
              }`}
              style={{ background: t.color, color: t.topiPattern }}
            >
              {t.id === team.id ? "✓" : ""}
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
      <button
        type="submit"
        disabled={busy}
        className="mt-auto min-h-[60px] cursor-pointer rounded-2xl border-0 bg-flag-red text-2xl font-extrabold text-white disabled:opacity-60"
      >
        {busy ? "Joining…" : "Join game"}
      </button>
    </form>
  );
}

"use client";

import { createContext, use, useMemo } from "react";
import { SETTINGS } from "./settings";

export type Settings = { -readonly [K in keyof typeof SETTINGS]: string };
export type SettingKey = keyof Settings;

/** Labels for the Host setup form, in the order they're shown. */
export const SETTING_FIELDS: { key: SettingKey; label: string; hint: string }[] = [
  { key: "clubName", label: "Club name", hint: "Shown on screens and your account" },
  { key: "gameUrl", label: "Game address", hint: "Short link players type, e.g. chhito.vercel.app/play" },
  { key: "registrationDeadline", label: "NC registration deadline", hint: "Set from ncsbe.gov for Nov. 3, 2026" },
  { key: "earlyVoting", label: "Early voting dates", hint: "Set from ncsbe.gov for Nov. 3, 2026" },
  { key: "electionDate", label: "Election date", hint: "Set from ncsbe.gov for Nov. 3, 2026" },
  { key: "clubInstagram", label: "Club Instagram", hint: "e.g. @yourclub" },
  { key: "team6Name", label: "6th team name", hint: "Only used with 6 teams" },
];

/** Only the values the host filled in; blanks keep the [PLACEHOLDER]. */
export function filledSettings(values: Partial<Settings> | null | undefined): Partial<Settings> {
  return Object.fromEntries(Object.entries(values ?? {}).filter(([, v]) => typeof v === "string" && v.trim())) as Partial<Settings>;
}

const SettingsContext = createContext<Settings>(SETTINGS);

/** Host-filled values for this game night (sessions.settings), falling back to the placeholders. */
export function SettingsProvider({ value, children }: { value: Partial<Settings> | null | undefined; children: React.ReactNode }) {
  const merged = useMemo(() => ({ ...SETTINGS, ...filledSettings(value) }), [value]);
  return <SettingsContext value={merged}>{children}</SettingsContext>;
}

export const useSettings = () => use(SettingsContext);

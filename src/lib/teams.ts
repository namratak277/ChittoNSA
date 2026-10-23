import { FLAG, INK } from "./colors";
import { SETTINGS } from "./settings";

export type TeamId = "blue" | "white" | "red" | "green" | "yellow" | "orange";
export type TeamCount = 4 | 5 | 6;

export interface Team {
  id: TeamId;
  name: string;
  /** Flag / team colour, used for drawings (topi, helmet, swatches). */
  color: string;
  /** Background that is safe behind text, and the text colour to use on it. */
  solid: string;
  onSolid: string;
  /** Light tint for lobby chips. */
  tint: string;
  /** Topi buddy scarf colour and topi zigzag colour. */
  scarf: string;
  topiPattern: string;
  /** What the flag colour stands for (shown on the join screen). */
  meaning: string | null;
}

export const TEAMS: Record<TeamId, Team> = {
  blue: {
    id: "blue",
    name: "Summit Seekers",
    color: FLAG.blue,
    solid: FLAG.blue,
    onSolid: "#FFFFFF",
    tint: "#DBE6FF",
    scarf: FLAG.yellow,
    topiPattern: "#FFFFFF",
    meaning: "Blue stands for sky and space.",
  },
  white: {
    id: "white",
    name: "Snow Leopards",
    color: FLAG.white,
    solid: FLAG.white,
    onSolid: INK,
    tint: "#FFFFFF",
    scarf: FLAG.blue,
    topiPattern: INK,
    meaning: "White stands for air and wind.",
  },
  red: {
    id: "red",
    name: "Himalayan Heroes",
    color: FLAG.red,
    solid: FLAG.red,
    onSolid: "#FFFFFF",
    tint: "#FDE2E2",
    scarf: FLAG.yellow,
    topiPattern: "#FFFFFF",
    meaning: "Red stands for fire.",
  },
  green: {
    id: "green",
    name: "Team Sagarmatha",
    color: FLAG.green,
    solid: FLAG.greenDark,
    onSolid: "#FFFFFF",
    tint: "#DCF5E3",
    scarf: FLAG.yellow,
    topiPattern: "#FFFFFF",
    meaning: "Green stands for water.",
  },
  yellow: {
    id: "yellow",
    name: "Momo Mountaineers",
    color: FLAG.yellow,
    solid: FLAG.yellow,
    onSolid: INK,
    tint: "#FFF1C2",
    scarf: FLAG.red,
    topiPattern: INK,
    meaning: "Yellow stands for earth.",
  },
  orange: {
    id: "orange",
    name: SETTINGS.team6Name,
    color: FLAG.orange,
    solid: FLAG.orangeDark,
    onSolid: "#FFFFFF",
    tint: "#FFE4D1",
    scarf: FLAG.blue,
    topiPattern: "#FFFFFF",
    meaning: null,
  },
};

const TEAM_ORDER: Record<TeamCount, TeamId[]> = {
  4: ["blue", "white", "red", "green"],
  5: ["blue", "white", "red", "green", "yellow"],
  6: ["blue", "white", "red", "green", "yellow", "orange"],
};

export function teamsFor(count: TeamCount): Team[] {
  return TEAM_ORDER[count].map((id) => TEAMS[id]);
}

/** The five prayer flags in traditional order (sky, air, fire, water, earth). */
export const PRAYER_FLAG_ORDER = [FLAG.blue, FLAG.white, FLAG.red, FLAG.green, FLAG.yellow] as const;

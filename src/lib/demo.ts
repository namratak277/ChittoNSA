// Fake data for the milestone 2 static screens. Replaced by live session data from milestone 4 on.
import seed from "../../content/seed.json";
import type { ClimberStyle } from "@/components/climbers/ClimberMarker";
import { teamsFor, type Team } from "./teams";

export const DEMO_PIN = "482913";

/** "482913" → "482 913" */
export const formatPin = (pin: string) => `${pin.slice(0, 3)} ${pin.slice(3)}`;

export interface DemoTeam {
  team: Team;
  members: number;
  points: number;
  /** Style of the first player who joined. */
  style: ClimberStyle;
  /** Checkpoint index on the mountain (0–4). */
  checkpoint: number;
  /** Supply points spent so far, and whether the team has locked in. */
  supplySpent: number;
  packed: boolean;
}

const [blue, white, red, green, yellow] = teamsFor(5);

export const DEMO_TEAMS: DemoTeam[] = [
  { team: blue, members: 5, points: 85, style: "topi", checkpoint: 3, supplySpent: 10, packed: true },
  { team: red, members: 5, points: 70, style: "headlamp", checkpoint: 2, supplySpent: 9, packed: true },
  { team: green, members: 5, points: 65, style: "topi", checkpoint: 2, supplySpent: 7, packed: false },
  { team: yellow, members: 4, points: 50, style: "headlamp", checkpoint: 1, supplySpent: 5, packed: false },
  { team: white, members: 4, points: 45, style: "topi", checkpoint: 1, supplySpent: 3, packed: false },
];

/** After the Dashain reveal: points this round and where each team ends up. */
export const DEMO_ROUND: Record<string, { gained: number; checkpoint: number }> = {
  blue: { gained: 15, checkpoint: 3 },
  red: { gained: 10, checkpoint: 3 },
  green: { gained: 10, checkpoint: 2 },
  yellow: { gained: 10, checkpoint: 2 },
  white: { gained: 0, checkpoint: 1 },
};

export const DEMO_CLIMBERS = DEMO_TEAMS.reduce((n, t) => n + t.members, 0);

const dashain = seed.questions.find((q) => q.prompt.startsWith("Dashain"))!;

export interface DemoQuestion {
  label: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  revealTitle: string;
  trailFact: string;
  /** How many teams picked each option. */
  teamCounts: number[];
}

export const DEMO_QUESTION: DemoQuestion = {
  label: "CHECKPOINT 2 · THE ROUTE · TRAIL QUESTION",
  prompt: dashain.prompt,
  options: dashain.options!,
  correctIndex: dashain.correct_index!,
  revealTitle: dashain.reveal_title!,
  trailFact: dashain.trail_fact!,
  teamCounts: [0, 1, 4, 0],
};

export const DEMO_STORM = seed.storm_cards[0];

export const DEBRIEF_QUESTIONS = [
  "What was the biggest challenge your team faced?",
  "Did your original plan change? How did you adapt?",
  "What happened when your team relied on information you couldn’t trust?",
  "How is preparing to vote like preparing for a hard journey?",
  "What’s one step you can take this week to get ready to vote?",
];

/** Teams sorted by points, highest first. */
export const ranked = (teams: DemoTeam[]) => [...teams].sort((a, b) => b.points - a.points);

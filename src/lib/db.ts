// Row shapes for the tables in supabase/migrations/0001_schema.sql.
import seed from "../../content/seed.json";
import type { ClimberStyle } from "@/components/climbers/ClimberMarker";
import type { SupplyId } from "./supplies";
import { TEAMS, type Team, type TeamCount, type TeamId } from "./teams";

export type Mode = "buttons" | "buzzer";
export type Topic = "nepal" | "voting";
export type QuestionType = "multiple_choice" | "info_cards" | "final_scenario";

export interface GameRow {
  id: string;
  maker_id: string;
  title: string;
  default_mode: Mode;
  created_at: string;
  updated_at: string;
}

export interface QuestionRow {
  id: string;
  game_id: string;
  checkpoint: 1 | 2 | 3 | 4;
  position: number;
  type: QuestionType;
  topic: Topic;
  prompt: string;
  options: string[];
  correct_index: number | null;
  reveal_title: string | null;
  trail_fact: string | null;
  timer_seconds: number;
}

export interface StormCardRow {
  id: string;
  game_id: string;
  position: number;
  title: string;
  body: string;
  helpful_supply: SupplyId | null;
}

export type SessionState = "LOBBY" | "SUPPLY_SHOP" | "QUESTION" | "REVEAL" | "STORM_EVENT" | "RESULTS" | "VOTING_PLAN" | "ENDED";

export interface SessionRow {
  id: string;
  game_id: string;
  maker_id: string;
  pin: string;
  mode: Mode;
  timer_seconds: number;
  team_count: TeamCount;
  state: SessionState;
  current_question_id: string | null;
  current_storm_id: string | null;
  phase_started_at: string | null;
  settings: Record<string, string>;
  voting_plans: number;
  public_question: PublicQuestion | null;
  public_card: PublicCard | null;
  started_at: string | null;
  created_at: string;
}

/** The current question as phones see it (sessions.public_question, see 0003_play.sql). */
export interface PublicQuestion {
  id: string;
  number: number;
  total: number;
  checkpoint: QuestionRow["checkpoint"];
  type: QuestionType;
  topic: Topic;
  prompt: string;
  options: string[];
  /** Buttons: whole question. Buzzer: each team's turn. */
  timer_seconds: number;
  mode: Mode;
  // Buzzer mode (team keys):
  buzz: TeamId[];
  missed: TeamId[];
  turn_team: TeamId | null;
  turn_started_at: string | null;
  // Added at the reveal:
  correct_index?: number | null;
  reveal_title?: string | null;
  trail_fact?: string | null;
  /** How many teams picked each answer. */
  team_counts?: number[];
  /** Points each team (by team key) earned this round. */
  gained?: Record<string, number>;
  /** Teams that earned the +5 Base Camp supply token this round. */
  prep?: Record<string, number>;
}

/** The storm card everyone sees during STORM_EVENT (sessions.public_card). */
export interface PublicCard {
  id: string;
  number: number;
  total: number;
  title: string;
  body: string;
  helpful_supply: SupplyId | null;
  seconds: number;
}

/** What my_team_answer / submit_answer return. */
export interface TeamAnswer {
  question_id: string;
  option_index: number;
  answered_by: string | null;
  mine: boolean;
}

export interface TeamRow {
  id: string;
  session_id: string;
  team_key: TeamId;
  name: string;
  position: number;
  points: number;
  members: number;
  marker_style: ClimberStyle | null;
  supplies: SupplyId[];
  supplies_locked: boolean;
  answered_question_id: string | null;
}

/** The team's colours and drawings, with the name stored for this session. */
export const teamOf = (row: Pick<TeamRow, "team_key" | "name">): Team => ({ ...TEAMS[row.team_key], name: row.name });

/** A question is written when it has a prompt and, if it has answers, every answer and a right one. */
export function isWritten(q: Pick<QuestionRow, "type" | "prompt" | "options" | "correct_index">) {
  if (!q.prompt.trim()) return false;
  if (q.type === "final_scenario") return true;
  return q.options.length >= 2 && q.options.every((o) => o.trim()) && q.correct_index !== null && q.correct_index < q.options.length;
}

/** Content for a brand-new game, taken from /content/seed.json. */
export function seedContent(gameId: string): { questions: QuestionRow[]; stormCards: StormCardRow[] } {
  const questions = seed.questions.map((q, i): QuestionRow => ({
    id: crypto.randomUUID(),
    game_id: gameId,
    checkpoint: q.checkpoint as QuestionRow["checkpoint"],
    position: i,
    type: q.type as QuestionType,
    topic: q.topic as Topic,
    prompt: q.prompt,
    options: q.options ?? ["", "", "", ""],
    correct_index: q.correct_index,
    reveal_title: q.reveal_title,
    trail_fact: q.trail_fact,
    timer_seconds: q.timer_seconds,
  }));
  const stormCards = seed.storm_cards.map((c, i): StormCardRow => ({
    id: crypto.randomUUID(),
    game_id: gameId,
    position: i,
    title: c.title,
    body: c.body,
    helpful_supply: c.helpful_supply as SupplyId | null,
  }));
  return { questions, stormCards };
}

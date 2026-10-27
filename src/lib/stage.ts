// Shared helpers for showing a live session on the projector and phones.
import type { ClimberStyle } from "@/components/climbers/ClimberMarker";
import { ANSWER_SLOTS } from "./answers";
import { CHECKPOINTS } from "./checkpoints";
import { teamOf, type PublicQuestion, type SessionRow, type TeamRow } from "./db";
import type { Team } from "./teams";

/** A team as the projector screens draw it. */
export interface StageTeam {
  team: Team;
  members: number;
  points: number;
  /** Style of the first player who joined. */
  style: ClimberStyle;
  /** Checkpoint index on the mountain (0–4). */
  checkpoint: number;
}

/** Teams sorted by points, highest first. */
export const ranked = <T extends { points: number }>(teams: T[]) => [...teams].sort((a, b) => b.points - a.points);

/**
 * How far up the mountain teams stand. The leading team reaches the checkpoint the game has got to
 * (never past Final Ascent until the results); the others stand in proportion to their points,
 * so markers only move up, and only when points change or the game reaches a new checkpoint.
 */
export function stageTeams(rows: TeamRow[], session: Pick<SessionRow, "state" | "public_question"> | null): StageTeam[] {
  const state = session?.state;
  const stage = state === "RESULTS" || state === "VOTING_PLAN" || state === "ENDED" ? 4 : Math.min(session?.public_question?.checkpoint ?? 0, 3);
  const best = Math.max(0, ...rows.map((r) => r.points));
  return rows.map((r) => ({
    team: teamOf(r),
    members: r.members,
    points: r.points,
    style: r.marker_style ?? "topi",
    checkpoint: best > 0 ? Math.round((stage * r.points) / best) : 0,
  }));
}

/** "CHECKPOINT 2 · ROUTE CHECKPOINT · TRAIL QUESTION" */
export function questionLabel(q: Pick<PublicQuestion, "checkpoint" | "topic" | "type">) {
  const kind = q.type === "final_scenario" ? "FINAL SCENARIO" : q.type === "info_cards" ? "WHO DO YOU TRUST?" : q.topic === "nepal" ? "TRAIL QUESTION" : "VOTING";
  return `CHECKPOINT ${q.checkpoint} · ${CHECKPOINTS[q.checkpoint - 1].name.toUpperCase()} · ${kind}`;
}

/** Reveal headline: the maker's, or "ग · 15 days". */
export function revealTitle(q: PublicQuestion) {
  if (q.reveal_title) return q.reveal_title;
  const i = q.correct_index;
  return i == null ? CHECKPOINTS[q.checkpoint - 1].name : `${ANSWER_SLOTS[i].letter} · ${q.options[i]}`;
}

/** What to teach after the reveal: the trail fact, or the checkpoint's voting lesson. */
export function afterFact(q: PublicQuestion): { title: string; text: string } {
  if (q.trail_fact) return { title: q.topic === "nepal" ? "TRAIL FACT" : "GOOD TO KNOW", text: q.trail_fact };
  return { title: "VOTING TIP", text: CHECKPOINTS[q.checkpoint - 1].votingLesson };
}

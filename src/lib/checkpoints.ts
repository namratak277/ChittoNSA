export interface Point {
  x: number;
  y: number;
}

export interface Checkpoint {
  order: 1 | 2 | 3 | 4 | 5;
  name: string;
  /** Where the stop sits on the projector mountain (1280×720 stage coordinates). */
  stop: Point;
  /** Label anchor (text is right-aligned to this point). */
  label: Point;
  votingLesson: string;
}

export const CHECKPOINTS: readonly Checkpoint[] = [
  {
    order: 1,
    name: "Base Camp",
    stop: { x: 440, y: 610 },
    label: { x: 424, y: 616 },
    votingLesson: "Check your registration status and eligibility. In NC, use the Voter Search on ncsbe.gov; for other states, vote.gov.",
  },
  {
    order: 2,
    name: "Route Checkpoint",
    stop: { x: 720, y: 555 },
    label: { x: 704, y: 561 },
    votingLesson:
      "Know where to find official info on locations, hours and deadlines: ncsbe.gov and your county board of elections (Guilford County for Greensboro).",
  },
  {
    order: 3,
    name: "Storm Zone",
    stop: { x: 560, y: 480 },
    label: { x: 544, y: 486 },
    votingLesson:
      "If your plan falls through, check official sources for alternatives such as early voting, voting by mail or a new location.",
  },
  {
    order: 4,
    name: "Final Ascent",
    stop: { x: 720, y: 400 },
    label: { x: 704, y: 406 },
    votingLesson: "A complete plan covers when, how, what's required and where to check for updates.",
  },
  {
    order: 5,
    name: "Summit",
    stop: { x: 640, y: 170 },
    label: { x: 622, y: 176 },
    votingLesson: "You planned your climb. Now plan your vote.",
  },
];

/** Talked through at the Summit, after everyone makes a voting plan. */
export const DEBRIEF_QUESTIONS = [
  "What was the biggest challenge your team faced?",
  "Did your original plan change? How did you adapt?",
  "What happened when your team relied on information you couldn’t trust?",
  "How is preparing to vote like preparing for a hard journey?",
  "What’s one step you can take this week to get ready to vote?",
];

/**
 * Point on the trail for a progress value from 0 (Base Camp) to 4 (Summit).
 * Fractional values fall between stops, so markers follow the trail when they move.
 */
export function trailPoint(progress: number): Point {
  const last = CHECKPOINTS.length - 1;
  const p = Math.min(Math.max(progress, 0), last);
  const i = Math.min(Math.floor(p), last - 1);
  const t = p - i;
  const a = CHECKPOINTS[i].stop;
  const b = CHECKPOINTS[i + 1].stop;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

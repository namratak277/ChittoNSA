import { FLAG, INK } from "./colors";

export interface AnswerSlot {
  /** Nepali letter used like A/B/C/D. */
  letter: "क" | "ख" | "ग" | "घ";
  bg: string;
  fg: string;
  /** Letter badge colours (white badge on dark flags, ink badge on yellow). */
  badgeBg: string;
  badgeFg: string;
  /** Inset shadow strength for the cloth fold at the top of the flag. */
  foldShadow: string;
  flagTilt: number;
  signTilt: number;
}

export const ANSWER_SLOTS: readonly AnswerSlot[] = [
  { letter: "क", bg: FLAG.blue, fg: "#FFFFFF", badgeBg: "#FFFFFF", badgeFg: FLAG.blue, foldShadow: "rgba(0,0,0,0.22)", flagTilt: -1.5, signTilt: -2 },
  { letter: "ख", bg: FLAG.red, fg: "#FFFFFF", badgeBg: "#FFFFFF", badgeFg: FLAG.red, foldShadow: "rgba(0,0,0,0.22)", flagTilt: 1, signTilt: 1.5 },
  { letter: "ग", bg: FLAG.greenDark, fg: "#FFFFFF", badgeBg: "#FFFFFF", badgeFg: FLAG.greenDark, foldShadow: "rgba(0,0,0,0.22)", flagTilt: -1, signTilt: -1.5 },
  { letter: "घ", bg: FLAG.yellow, fg: INK, badgeBg: INK, badgeFg: FLAG.yellow, foldShadow: "rgba(0,0,0,0.18)", flagTilt: 1.5, signTilt: 2 },
];

/** Ragged cloth bottom edge for projector flags. */
export const FLAG_CLIP =
  "polygon(0 0, 100% 0, 100% 86%, 92% 100%, 83% 86%, 75% 100%, 67% 86%, 58% 100%, 50% 86%, 42% 100%, 33% 86%, 25% 100%, 17% 86%, 8% 100%, 0 86%)";

/** Arrow-shaped trail sign for phones. */
export const SIGN_CLIP = "polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)";

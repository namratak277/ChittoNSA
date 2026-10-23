import seed from "../../content/seed.json";

// Values the host fills in. They stay as [PLACEHOLDERS] until set; never invent them.
const p = seed.placeholders;

export const SETTINGS = {
  clubName: p["CLUB NAME"],
  gameUrl: p["GAME URL"],
  prize: p["PRIZE"],
  registrationDeadline: p["NC REGISTRATION DEADLINE"],
  electionDate: p["ELECTION DATE"],
  clubInstagram: p["CLUB INSTAGRAM"],
  team6Name: p["TEAM 6 NAME"],
} as const;

export const OFFICIAL_LINKS = {
  voteGov: { href: "https://vote.gov", label: "vote.gov" },
  ncsbe: { href: "https://www.ncsbe.gov", label: "ncsbe.gov" },
} as const;

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
  ncsbeVoting: { href: "https://www.ncsbe.gov/voting", label: "ncsbe.gov/voting" },
} as const;

/** The club plays in Greensboro, which votes through the Guilford County Board of Elections. */
export const LOCAL = { city: "Greensboro", county: "Guilford County" } as const;

/** Official NC State Board of Elections tools (checked on ncsbe.gov). Work for every NC county, not just Guilford. */
export const NC_VOTING_LINKS = [
  { href: "https://vt.ncsbe.gov/RegLkup/", label: "Check my registration" },
  { href: "https://vt.ncsbe.gov/PPLkup/", label: "Find my Election Day polling place" },
  { href: "https://vt.ncsbe.gov/EVSite/", label: "Find early voting sites" },
  { href: "https://www.ncsbe.gov/voting/vote-mail", label: "Vote by mail" },
  { href: "https://www.ncsbe.gov/voting/voter-id", label: "What ID to bring" },
  { href: "https://vt.ncsbe.gov/BOEInfo/", label: "Find my county board of elections" },
] as const;

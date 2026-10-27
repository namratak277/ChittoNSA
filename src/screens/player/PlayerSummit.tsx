"use client";

import { ClimberMarker, type ClimberStyle } from "@/components/climbers/ClimberMarker";
import { FLAG, GLACIER, INK } from "@/lib/colors";
import { NC_VOTING_LINKS, OFFICIAL_LINKS } from "@/lib/settings";
import type { Team } from "@/lib/teams";
import { useSettings } from "@/lib/useSettings";

interface PlayerSummitProps {
  team: Team;
  style: ClimberStyle;
  place: number;
  points: number;
  /** Team stats, not personal ones. */
  teamCorrect: number;
  questionCount: number;
  teamBestStreak: number;
  planMade: boolean;
}

function ordinal(n: number) {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

/** Final team rank on the phone (design-reference/Phone-Summit.dc.html). */
export function PlayerSummit({ team, style, place, points, teamCorrect, questionCount, teamBestStreak, planMade }: PlayerSummitProps) {
  const settings = useSettings();
  // "@uncgnsa" → link to the profile; a [PLACEHOLDER] stays plain text.
  const instagram = /^@?[\w.]+$/.test(settings.clubInstagram) ? settings.clubInstagram.replace(/^@/, "") : null;
  return (
    <>
      <svg viewBox="0 0 350 170" aria-hidden className="block w-full">
        <path d="M10 160 L70 125 L115 92 L150 58 L175 30 L200 60 L240 96 L285 130 L340 160 Z" fill={GLACIER.lit} />
        <path d="M175 30 L200 60 L240 96 L285 130 L340 160 L230 160 L212 112 L188 70 Z" fill={GLACIER.shadow} />
        <path d="M160 48 L175 30 L188 70 L180 62 L174 72 L167 60 Z" fill="#FFFFFF" />
        <path d="M175 30 L200 60 L206 72 L196 76 L188 70 Z" fill="#E2ECFC" />
        <path d="M0 170 L0 152 Q90 140 175 156 Q260 140 350 152 L350 170 Z" fill={GLACIER.foothill} />
        <path d="M175 30 L175 6" stroke={INK} strokeWidth="2.5" />
        <rect x="176" y="6" width="10" height="9" fill={FLAG.blue} />
        <rect x="186" y="9" width="10" height="9" fill={FLAG.yellow} />
        <foreignObject x="172" y="46" width="38" height="38">
          <ClimberMarker style={style} team={team} size={38} />
        </foreignObject>
      </svg>
      <div className="text-center">
        <p className="text-lg font-bold text-flag-red">Expedition complete</p>
        <h1 className="text-[40px] font-extrabold leading-[1.05]">
          {ordinal(place)} place · {points} pts
        </h1>
        <p className="text-[17px] text-body">
          {team.name}
          {place === 1 ? " — Summit Champions!" : " — great climb!"}
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-2">
        <div className="rounded-[14px] border-2 border-ink bg-white p-2.5 text-center">
          <dd className="text-[26px] font-extrabold">
            {teamCorrect}/{questionCount}
          </dd>
          <dt className="text-sm">team correct</dt>
        </div>
        <div className="rounded-[14px] border-2 border-ink bg-white p-2.5 text-center">
          <dd className="text-[26px] font-extrabold">{teamBestStreak}</dd>
          <dt className="text-sm">team best streak</dt>
        </div>
        <div className={`rounded-[14px] border-2 border-ink p-2.5 text-center ${planMade ? "bg-success-bg" : "bg-white"}`}>
          <dd className="text-[26px] font-extrabold">{planMade ? "Done" : "Not yet"}</dd>
          <dt className="text-sm">voting plan</dt>
        </div>
      </dl>
      <div className="flex flex-col gap-2.5 rounded-[18px] border-[3px] border-ink bg-white p-4">
        <p className="text-xl font-extrabold">Your next summit: Election Day</p>
        <p className="text-[15px] text-body">Election Day: {settings.electionDate}</p>
        <a
          href={NC_VOTING_LINKS[0].href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] items-center justify-center rounded-[14px] bg-flag-blue text-lg font-extrabold text-white no-underline"
        >
          Check my NC registration · ncsbe.gov
        </a>
        <p className="text-[15px] text-body">
          Registered in another state? Check at{" "}
          <a href={OFFICIAL_LINKS.voteGov.href} target="_blank" rel="noopener noreferrer" className="font-bold text-flag-blue">
            vote.gov
          </a>
          .
        </p>
        <p className="text-[15px] text-body">
          Follow{" "}
          {instagram ? (
            <a href={`https://www.instagram.com/${instagram}/`} target="_blank" rel="noopener noreferrer" className="font-bold text-flag-blue">
              {settings.clubInstagram}
            </a>
          ) : (
            settings.clubInstagram
          )}{" "}
          for the next event.
        </p>
      </div>
    </>
  );
}

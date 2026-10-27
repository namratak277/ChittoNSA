"use client";

import { FlagRope } from "@/components/answers/FlagRope";
import { Mountain } from "@/components/mountain/Mountain";
import { MountainMarkers } from "@/components/mountain/MountainMarkers";
import { TimerRing } from "@/components/ui/TimerRing";
import { ranked, type StageTeam } from "@/lib/stage";

export type ClimbPhase = "question" | "reveal" | "buzzer";

export interface ClimbQuestion {
  label: string;
  prompt: string;
  /** Empty for a talk-it-through question (final scenario). */
  options: string[];
  /** -1 when there's no right answer to show. */
  correctIndex: number;
  revealTitle: string;
  trailFact: string;
  /** Heading over the fact after the reveal (defaults to TRAIL FACT). */
  factTitle?: string;
  /** How many teams picked each answer. */
  teamCounts: number[];
}

export interface HostAction {
  label: string;
  onClick: () => void;
}

export interface BuzzerState {
  /** Teams in buzz-in order. */
  order: StageTeam[];
  /** Index in `order` of the team answering now, or -1. */
  turn: number;
  /** Teams still solving the flag puzzle. */
  solving: number;
  /** How many teams at the front of `order` have already missed. */
  missed: number;
  /** Seconds left in the current team's turn. */
  secondsLeft: number | null;
  /** What the answering team picked, e.g. "ग · 15 days (right)". */
  picked: string | null;
  onRight: () => void;
  onWrong: () => void;
}

interface HostClimbProps {
  phase: ClimbPhase;
  question: ClimbQuestion;
  teams: StageTeam[];
  /** Buzz-in order and turn (buzzer phase). */
  buzzer?: BuzzerState;
  /** Host scorecard, shown while teams talk through a final scenario. */
  scorecard?: React.ReactNode;
  /** Points each team gained this round (reveal phase). */
  gained?: Record<string, number>;
  /** Null when the question has no timer running. */
  secondsLeft: number | null;
  /** Teams that have locked an answer (question phase). */
  answered: number;
  onReveal: () => void;
  /** Buttons after the reveal; the first is the main one. */
  next: HostAction[];
  /** True while a host action is saving, so buttons can't be double-clicked. */
  busy?: boolean;
}

const panel = "absolute flex flex-col rounded-[20px] border-[3px] border-ink bg-white box-border";

/**
 * The question on the mountain: Mountain, Host-Reveal and Host-Buzzer in one component,
 * so team markers walk up the trail when the phase changes from question to reveal.
 */
export function HostClimb({ phase, question, teams, buzzer, scorecard, gained = {}, secondsLeft, answered, onReveal, next, busy = false }: HostClimbProps) {
  const climbers = teams.reduce((n, t) => n + t.members, 0);
  const rightCount = question.teamCounts[question.correctIndex] ?? 0;
  const markers = teams.map((t) => ({ team: t.team, style: t.style, checkpoint: t.checkpoint }));
  const talkItThrough = question.options.length === 0;
  const allIn = answered >= teams.length;

  return (
    <>
      <Mountain className="absolute inset-0" />
      <MountainMarkers markers={markers} />

      <div className="absolute left-[310px] top-[14px] w-[660px] text-center">
        {phase === "reveal" ? (
          <>
            <p className="text-[17px] font-bold leading-tight tracking-[1px] text-flag-green-dark">
              {talkItThrough ? "GREAT CLIMBING, EVERY TEAM" : `ANSWER · ${rightCount} OF ${teams.length} TEAMS GOT IT RIGHT`}
            </p>
            <h1 className="text-[30px] font-extrabold leading-[1.1]">{question.revealTitle}</h1>
          </>
        ) : (
          <>
            <p className="text-[17px] font-bold leading-tight tracking-[1px] text-flag-red">
              {phase === "buzzer" ? `BUZZER MODE · ${question.label.replace(" · TRAIL QUESTION", "")}` : question.label}
            </p>
            <h1 className="text-[30px] font-extrabold leading-[1.1]">{question.prompt}</h1>
          </>
        )}
      </div>

      {phase === "question" && (
        <>
          <div className={`${panel} left-10 top-[150px] w-[210px] items-center gap-2.5 p-[18px]`}>
            {secondsLeft !== null && (
              <>
                <TimerRing value={secondsLeft} label={secondsLeft > 0 ? `${secondsLeft} seconds left` : "Time's up"} />
                <p className="text-lg font-bold">{secondsLeft > 0 ? "seconds left" : "Time's up!"}</p>
              </>
            )}
            <p className="text-center text-base text-body">
              {talkItThrough ? "Teams talk it through, then one person explains" : allIn ? "Every team has answered" : `${answered} of ${teams.length} teams answered`}
            </p>
            <button
              type="button"
              onClick={onReveal}
              disabled={busy}
              className="min-h-11 w-full cursor-pointer rounded-xl border-0 bg-ink text-[17px] font-extrabold text-white disabled:opacity-60"
            >
              {talkItThrough ? "Done talking" : "Reveal now"}
            </button>
            {!talkItThrough && <p className="text-center text-[13px] leading-snug text-body">The answer shows by itself when time runs out.</p>}
          </div>
          {talkItThrough && scorecard ? <div className="absolute right-10 top-[130px] w-[486px]">{scorecard}</div> : <TeamPoints teams={teams} />}
        </>
      )}

      {phase === "reveal" && (
        <>
          <div className={`${panel} left-10 top-[150px] w-[250px] gap-2 p-[18px]`}>
            <p className="text-[15px] font-bold tracking-[1px] text-flag-red">{question.factTitle ?? "TRAIL FACT"}</p>
            <p className="text-lg leading-snug">{question.trailFact}</p>
          </div>
          <div className={`${panel} right-10 top-[150px] w-[250px] gap-2 p-[18px]`}>
            <p className="text-xl font-extrabold">Leaderboard</p>
            <ol className="flex flex-col gap-1">
              {ranked(teams).map(({ team, points }, i) => {
                const pts = gained[team.id] ?? 0;
                return (
                  <li key={team.id} className="flex items-baseline gap-2 text-base">
                    <b className="w-4 shrink-0">{i + 1}</b>
                    <span className="grow leading-tight">{team.name}</span>
                    <b>{points}</b>
                    <span className={`w-9 shrink-0 text-right text-sm ${pts > 0 ? "font-bold text-flag-green-dark" : "text-body"}`}>+{pts}</span>
                  </li>
                );
              })}
            </ol>
            <p className="text-[13px] leading-snug text-body">
              {talkItThrough ? "A miss costs nothing. Every team keeps climbing." : "+10 for a right answer, up to +5 more for answering fast. A miss costs nothing."}
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {next.map((action, i) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  disabled={busy}
                  className={`min-h-12 cursor-pointer rounded-[14px] disabled:opacity-60 ${
                    i === 0 ? "border-0 bg-ink text-lg font-extrabold text-white" : "border-2 border-ink bg-white text-[17px] font-bold"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {phase === "buzzer" && buzzer && <BuzzerPanels buzzer={buzzer} onReveal={onReveal} busy={busy} />}

      <div className="absolute left-[456px] top-[592px] flex h-9 items-center rounded-[18px] bg-ink px-3 text-base font-extrabold text-white">
        {phase === "reveal" ? `All ${teams.length} teams still climbing` : `${climbers} climbers · ${teams.length} teams`}
      </div>

      {!talkItThrough && (
        <FlagRope
          options={question.options}
          reveal={phase === "reveal" && question.correctIndex >= 0 ? { correctIndex: question.correctIndex, teamCounts: question.teamCounts } : undefined}
        />
      )}
    </>
  );
}

function TeamPoints({ teams }: { teams: StageTeam[] }) {
  return (
    <div className={`${panel} right-10 top-[150px] w-[230px] gap-2 p-[18px]`}>
      <p className="text-xl font-extrabold">Team points</p>
      <ol className="flex flex-col gap-2">
        {ranked(teams).map(({ team, points }, i) => (
          <li key={team.id} className="flex justify-between text-base">
            <span>
              <b>{i + 1}</b> {team.name}
            </span>
            <b>{points}</b>
          </li>
        ))}
      </ol>
      <p className="mt-1 text-[13px] leading-snug text-body">Teams climb as they earn points. No team is ever knocked out.</p>
    </div>
  );
}

function BuzzerPanels({ buzzer, onReveal, busy }: { buzzer: BuzzerState; onReveal: () => void; busy: boolean }) {
  const { order, turn, missed, solving, secondsLeft, picked } = buzzer;
  const current = order[turn];
  const next = turn >= 0 ? order[turn + 1] : undefined;
  const status = (i: number) => (i < missed ? "missed" : i === turn ? "answering" : "waiting");
  return (
    <>
      <div className={`${panel} left-10 top-[130px] w-[290px] gap-2 px-4 py-4`}>
        <p className="text-xl font-extrabold">Team buzz-in order</p>
        {order.length === 0 && <p className="text-base text-body">Teams are solving the flag puzzle…</p>}
        <ol className="flex flex-col gap-1.5">
          {order.map(({ team }, i) => (
            <li
              key={team.id}
              className={`flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 text-base font-bold leading-tight ${
                i === turn ? "border-ink bg-[#FFF1C2]" : "border-transparent"
              } ${i < missed ? "opacity-45" : ""}`}
            >
              <span
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full text-base font-extrabold"
                style={{ background: team.solid, color: team.onSolid, border: team.id === "white" ? "2px solid #1E1B2E" : undefined }}
              >
                {i + 1}
              </span>
              <span className="grow">{team.name}</span>
              <span className="text-[13px] font-semibold">{status(i)}</span>
            </li>
          ))}
        </ol>
        {solving > 0 && (
          <p className="text-[15px] text-body">
            {solving} {solving === 1 ? "team" : "teams"} still solving the flag puzzle
          </p>
        )}
      </div>
      <div className={`${panel} right-10 top-[130px] w-[240px] items-center gap-2.5 px-[18px] py-4`}>
        {current ? (
          <>
            <p className="text-center text-lg font-extrabold">{current.team.name} — answering now</p>
            {secondsLeft !== null && (
              <TimerRing value={secondsLeft} label={secondsLeft > 0 ? `${secondsLeft} seconds to answer` : "Time's up"} size={88} />
            )}
            <p className="text-center text-[15px] text-body">{picked ? `Picked ${picked}` : secondsLeft === 0 ? "Time's up" : "seconds to answer"}</p>
          </>
        ) : (
          <p className="text-center text-lg font-extrabold">{order.length ? "Every buzzed team has tried" : "Waiting for the first buzz"}</p>
        )}
        <p className="self-start text-[13px] font-extrabold tracking-[1px]">HOST CONTROLS</p>
        {current && (
          <button
            type="button"
            onClick={onReveal}
            disabled={busy}
            className="min-h-11 w-full cursor-pointer rounded-xl border-0 bg-flag-green-dark text-base font-extrabold text-white disabled:opacity-60"
          >
            Right → reveal
          </button>
        )}
        <button
          type="button"
          onClick={current ? buzzer.onWrong : onReveal}
          disabled={busy}
          className="min-h-11 w-full cursor-pointer rounded-xl border-2 border-ink bg-white text-base font-bold disabled:opacity-60"
        >
          {!current ? "Reveal answer" : next ? `Wrong → next: ${next.team.name}` : "Wrong → next team to buzz"}
        </button>
      </div>
    </>
  );
}

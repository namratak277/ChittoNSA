"use client";

import { useState } from "react";
import { FlagRope } from "@/components/answers/FlagRope";
import { Mountain } from "@/components/mountain/Mountain";
import { MountainMarkers } from "@/components/mountain/MountainMarkers";
import { TimerRing } from "@/components/ui/TimerRing";
import { ranked, type DemoQuestion, type DemoTeam } from "@/lib/demo";

export type ClimbPhase = "question" | "reveal" | "buzzer";

interface HostClimbProps {
  phase: ClimbPhase;
  question: DemoQuestion;
  teams: DemoTeam[];
  /** Teams ranked by buzz-in order (buzzer phase). */
  buzzOrder?: DemoTeam[];
  /** Points each team gained this round (reveal phase). */
  gained?: Record<string, number>;
  secondsLeft: number;
  onReveal: () => void;
  onNextQuestion: () => void;
  onStorm: () => void;
}

const panel = "absolute flex flex-col rounded-[20px] border-[3px] border-ink bg-white box-border";

/**
 * The question on the mountain: Mountain, Host-Reveal and Host-Buzzer in one component,
 * so team markers walk up the trail when the phase changes from question to reveal.
 */
export function HostClimb({ phase, question, teams, buzzOrder = [], gained = {}, secondsLeft, onReveal, onNextQuestion, onStorm }: HostClimbProps) {
  const climbers = teams.reduce((n, t) => n + t.members, 0);
  const rightCount = question.teamCounts[question.correctIndex];
  const markers = teams.map((t) => ({ team: t.team, style: t.style, checkpoint: t.checkpoint }));

  return (
    <>
      <Mountain className="absolute inset-0" />
      <MountainMarkers markers={markers} />

      <div className="absolute left-[310px] top-[14px] w-[660px] text-center">
        {phase === "reveal" ? (
          <>
            <p className="text-[17px] font-bold leading-tight tracking-[1px] text-flag-green-dark">
              ANSWER · {rightCount} OF {teams.length} TEAMS GOT IT RIGHT
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
            <TimerRing value={secondsLeft} label={`${secondsLeft} seconds left`} />
            <p className="text-lg font-bold">seconds left</p>
            <p className="text-base text-body">4 of {teams.length} teams answered</p>
            <button type="button" onClick={onReveal} className="min-h-11 w-full cursor-pointer rounded-xl border-0 bg-ink text-[17px] font-extrabold text-white">
              Reveal answer
            </button>
          </div>
          <TeamPoints teams={teams} />
        </>
      )}

      {phase === "reveal" && (
        <>
          <div className={`${panel} left-10 top-[150px] w-[250px] gap-2 p-[18px]`}>
            <p className="text-[15px] font-bold tracking-[1px] text-flag-red">TRAIL FACT</p>
            <p className="text-lg leading-snug">{question.trailFact}</p>
          </div>
          <div className={`${panel} right-10 top-[150px] w-[250px] gap-2 p-[18px]`}>
            <p className="text-xl font-extrabold">Points this round</p>
            <ul className="flex flex-col gap-1">
              {ranked(teams).map(({ team }) => {
                const pts = gained[team.id] ?? 0;
                return (
                  <li key={team.id} className="flex justify-between gap-2 text-base">
                    <span>{team.name}</span>
                    <span className={pts > 0 ? "font-bold text-flag-green-dark" : ""}>+{pts}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-[13px] leading-snug text-body">A miss costs nothing. Every team keeps climbing.</p>
            <div className="mt-2 flex flex-col gap-2">
              <button type="button" onClick={onNextQuestion} className="min-h-12 cursor-pointer rounded-[14px] border-0 bg-ink text-lg font-extrabold text-white">
                Next question
              </button>
              <button type="button" onClick={onStorm} className="min-h-12 cursor-pointer rounded-[14px] border-2 border-ink bg-white text-[17px] font-bold">
                Next: Storm Zone event
              </button>
            </div>
          </div>
        </>
      )}

      {phase === "buzzer" && <BuzzerPanels order={buzzOrder} onRight={onReveal} />}

      <div className="absolute left-[456px] top-[592px] flex h-9 items-center rounded-[18px] bg-ink px-3 text-base font-extrabold text-white">
        {phase === "reveal" ? `All ${teams.length} teams still climbing` : `${climbers} climbers · ${teams.length} teams`}
      </div>

      <FlagRope
        options={question.options}
        reveal={phase === "reveal" ? { correctIndex: question.correctIndex, teamCounts: question.teamCounts } : undefined}
      />
    </>
  );
}

function TeamPoints({ teams }: { teams: DemoTeam[] }) {
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

function BuzzerPanels({ order, onRight }: { order: DemoTeam[]; onRight: () => void }) {
  const [turn, setTurn] = useState(0);
  const current = order[turn];
  const next = order[turn + 1];
  return (
    <>
      <div className={`${panel} left-10 top-[130px] w-[290px] gap-2 px-4 py-4`}>
        <p className="text-xl font-extrabold">Team buzz-in order</p>
        <ol className="flex flex-col gap-1.5">
          {order.map(({ team }, i) => (
            <li
              key={team.id}
              className={`flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 text-base font-bold leading-tight ${
                i === turn ? "border-ink bg-[#FFF1C2]" : "border-transparent"
              } ${i < turn ? "opacity-45" : ""}`}
            >
              <span
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full text-base font-extrabold"
                style={{ background: team.solid, color: team.onSolid, border: team.id === "white" ? "2px solid #1E1B2E" : undefined }}
              >
                {i + 1}
              </span>
              <span className="grow">{team.name}</span>
              <span className="text-[13px] font-semibold">{i < turn ? "missed" : i === turn ? "answering" : "waiting"}</span>
            </li>
          ))}
        </ol>
        <p className="text-[15px] text-body">1 team still solving the flag puzzle</p>
      </div>
      <div className={`${panel} right-10 top-[130px] w-[240px] items-center gap-2.5 px-[18px] py-4`}>
        <p className="text-center text-lg font-extrabold">{current.team.name} — answering now</p>
        <TimerRing value={7} label="7 seconds to answer" size={88} />
        <p className="text-[15px] text-body">seconds to answer</p>
        <p className="self-start text-[13px] font-extrabold tracking-[1px]">HOST CONTROLS</p>
        <button type="button" onClick={onRight} className="min-h-11 w-full cursor-pointer rounded-xl border-0 bg-flag-green-dark text-base font-extrabold text-white">
          Right → reveal
        </button>
        <button
          type="button"
          onClick={() => (next ? setTurn(turn + 1) : onRight())}
          className="min-h-11 w-full cursor-pointer rounded-xl border-2 border-ink bg-white text-base font-bold"
        >
          {next ? `Wrong → next: ${next.team.name}` : "Wrong → reveal answer"}
        </button>
      </div>
    </>
  );
}

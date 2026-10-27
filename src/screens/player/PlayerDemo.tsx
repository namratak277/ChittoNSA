"use client";

import { use, useState } from "react";
import type { ClimberStyle } from "@/components/climbers/ClimberMarker";
import { DemoNav } from "@/components/dev/DemoNav";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { DEMO_QUESTION, DEMO_TEAMS } from "@/lib/demo";
import type { SupplyId } from "@/lib/supplies";
import { TEAMS, teamsFor, type Team } from "@/lib/teams";
import { PlayerAnswer } from "./PlayerAnswer";
import { PlayerBuzzer, type BuzzerStatus } from "./PlayerBuzzer";
import { PlayerJoin } from "./PlayerJoin";
import { PlayerLobby } from "./PlayerLobby";
import { PlayerPledge } from "./PlayerPledge";
import { PlayerSummit } from "./PlayerSummit";
import { PlayerSupplies } from "./PlayerSupplies";

const SCREENS = [
  { id: "join", label: "Join" },
  { id: "lobby", label: "Joined, waiting" },
  { id: "supplies", label: "Supply shop" },
  { id: "answer", label: "Answer (Buttons)" },
  { id: "buzzer", label: "Answer (Buzzer)" },
  { id: "summit", label: "Final team rank" },
  { id: "pledge", label: "My voting plan" },
] as const;

type Screen = (typeof SCREENS)[number]["id"];

interface Player {
  nickname: string;
  team: Team;
  style: ClimberStyle;
}

const demoButton = "min-h-12 cursor-pointer rounded-[14px] border-2 border-ink bg-white text-[17px] font-bold";

function DemoSupplies({ team }: { team: Team }) {
  const [picked, setPicked] = useState<SupplyId[]>(["map", "radio", "food"]);
  const [locked, setLocked] = useState(false);
  return (
    <PlayerSupplies
      team={team}
      picked={picked}
      locked={locked}
      onToggle={(id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))}
      onLock={setLocked}
      nextQuestion="Before Election Day, what should you check first?"
    />
  );
}

/** Buzzer screen with buttons standing in for the host. */
function DemoBuzzer({ aheadTeamName }: { aheadTeamName: string }) {
  const [status, setStatus] = useState<BuzzerStatus>({ kind: "puzzle" });
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const reset = () => {
    setStatus({ kind: "puzzle" });
    setPick(null);
    setRound((r) => r + 1);
  };
  if (pick !== null) {
    const right = pick === DEMO_QUESTION.correctIndex;
    return (
      <PlayerAnswer
        label="BUZZER MODE · Q 5"
        prompt={DEMO_QUESTION.prompt}
        options={DEMO_QUESTION.options}
        checkpoint={2}
        locked={{ index: pick }}
        result={{
          correct: right,
          headline: right ? "Correct! +10 for your team" : "Not this time",
          subline: right ? "Your team climbs toward the summit." : `No points lost. The answer was ${DEMO_QUESTION.options[DEMO_QUESTION.correctIndex]}.`,
          fact: null,
        }}
      >
        <button type="button" onClick={reset} className={`mt-auto ${demoButton}`}>
          Play the puzzle again (demo)
        </button>
      </PlayerAnswer>
    );
  }
  return (
    <PlayerBuzzer
      key={round}
      label="BUZZER MODE · Q 5"
      prompt={DEMO_QUESTION.prompt}
      options={DEMO_QUESTION.options}
      status={status}
      onBuzz={() => setStatus({ kind: "queued", place: 2, answering: aheadTeamName })}
      onPick={setPick}
    >
      {status.kind === "queued" && (
        <button type="button" onClick={() => setStatus({ kind: "turn", secondsLeft: 10, locked: null })} className={demoButton}>
          Demo: they missed →
        </button>
      )}
    </PlayerBuzzer>
  );
}

/** The answer screen with buttons standing in for the host. */
function DemoAnswer({ onPlan }: { onPlan: () => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const right = pick === DEMO_QUESTION.correctIndex;
  return (
    <PlayerAnswer
      label="CHECKPOINT 2 · THE ROUTE"
      prompt={DEMO_QUESTION.prompt}
      options={DEMO_QUESTION.options}
      checkpoint={revealed && right ? 3 : 2}
      locked={pick === null ? null : { index: pick }}
      onPick={setPick}
      result={
        revealed
          ? {
              correct: right,
              headline: right ? "Correct! +13 for your team" : "Not this time",
              subline: right
                ? "+3 speed bonus. Your team climbs toward the Final Ascent."
                : `No points lost, and your team keeps climbing. The answer was ${DEMO_QUESTION.options[DEMO_QUESTION.correctIndex]}.`,
              fact: { title: "TRAIL FACT", text: DEMO_QUESTION.trailFact },
            }
          : undefined
      }
    >
      {pick !== null && !revealed && (
        <button type="button" onClick={() => setRevealed(true)} className={`mt-auto ${demoButton}`}>
          Demo: host reveals the answer →
        </button>
      )}
      {revealed && (
        <>
          <button
            type="button"
            onClick={() => {
              setPick(null);
              setRevealed(false);
            }}
            className={`mt-auto ${demoButton}`}
          >
            Try again (demo)
          </button>
          <button type="button" onClick={onPlan} className="cursor-pointer border-0 bg-transparent text-[15px] text-flag-blue underline">
            Demo: jump to my voting plan →
          </button>
        </>
      )}
    </PlayerAnswer>
  );
}

/** Clickable static version of the phone screens. The live game is PlayerLive. */
export function PlayerDemo({ pin }: { pin?: Promise<string> }) {
  const initialPin = pin ? use(pin) : "";
  const [screen, setScreen] = useState<Screen>("join");
  const [player, setPlayer] = useState<Player>({ nickname: "Momo Master", team: TEAMS.red, style: "headlamp" });
  const [planMade, setPlanMade] = useState(false);

  const standing = [...DEMO_TEAMS].sort((a, b) => b.points - a.points);
  const place = Math.max(1, standing.findIndex((t) => t.team.id === player.team.id) + 1);
  const ahead = DEMO_TEAMS.find((t) => t.team.id !== player.team.id)!.team.name;

  return (
    <>
      <PhoneShell>
        {screen === "join" && (
          <PlayerJoin
            initialPin={initialPin}
            teams={teamsFor(5)}
            onJoin={({ nickname, team, style }) => {
              setPlayer({ nickname, team, style });
              setScreen("lobby");
            }}
          />
        )}
        {screen === "lobby" && <PlayerLobby {...player} />}
        {screen === "supplies" && <DemoSupplies team={player.team} />}
        {screen === "answer" && <DemoAnswer onPlan={() => setScreen("pledge")} />}
        {screen === "buzzer" && <DemoBuzzer aheadTeamName={ahead} />}
        {screen === "summit" && (
          <PlayerSummit
            team={player.team}
            style={player.style}
            place={place}
            points={standing[place - 1]?.points ?? 0}
            teamCorrect={9}
            questionCount={12}
            teamBestStreak={4}
            planMade={planMade}
          />
        )}
        {screen === "pledge" && <PlayerPledge onPlanMade={() => setPlanMade(true)} />}
      </PhoneShell>
      <DemoNav screens={SCREENS} current={screen} onChange={setScreen} />
    </>
  );
}

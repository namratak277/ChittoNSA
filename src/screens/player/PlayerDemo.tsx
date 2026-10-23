"use client";

import { use, useState } from "react";
import type { ClimberStyle } from "@/components/climbers/ClimberMarker";
import { DemoNav } from "@/components/dev/DemoNav";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { DEMO_QUESTION, DEMO_TEAMS } from "@/lib/demo";
import { TEAMS, teamsFor, type Team } from "@/lib/teams";
import { PlayerAnswer } from "./PlayerAnswer";
import { PlayerBuzzer } from "./PlayerBuzzer";
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

/** Clickable static version of the phone screens. Live game state replaces this from milestone 4. */
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
        {screen === "supplies" && <PlayerSupplies team={player.team} nextQuestion="Before Election Day, what should you check first?" />}
        {screen === "answer" && (
          <PlayerAnswer label="CHECKPOINT 2 · THE ROUTE" question={DEMO_QUESTION} checkpoint={2} onPlan={() => setScreen("pledge")} />
        )}
        {screen === "buzzer" && <PlayerBuzzer question={DEMO_QUESTION} questionNumber={5} aheadTeamName={ahead} />}
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

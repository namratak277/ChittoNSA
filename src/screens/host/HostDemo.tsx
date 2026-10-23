"use client";

import { use, useState } from "react";
import { DemoNav } from "@/components/dev/DemoNav";
import { HostStage } from "@/components/layout/HostStage";
import { DEMO_CLIMBERS, DEMO_QUESTION, DEMO_ROUND, DEMO_STORM, DEMO_TEAMS, type DemoTeam } from "@/lib/demo";
import { HostClimb } from "./HostClimb";
import { HostLobby } from "./HostLobby";
import { HostPledge } from "./HostPledge";
import { HostStorm } from "./HostStorm";
import { HostSummit } from "./HostSummit";
import { HostSupplies } from "./HostSupplies";

const SCREENS = [
  { id: "lobby", label: "Welcome to Base Camp" },
  { id: "supplies", label: "Supply shop" },
  { id: "question", label: "Question (Buttons)" },
  { id: "reveal", label: "Reveal" },
  { id: "buzzer", label: "Question (Buzzer)" },
  { id: "storm", label: "Storm Zone" },
  { id: "summit", label: "Summit Champions" },
  { id: "pledge", label: "Summit to the ballot" },
] as const;

type Screen = (typeof SCREENS)[number]["id"];

const afterRound: DemoTeam[] = DEMO_TEAMS.map((t) => ({
  ...t,
  points: t.points + DEMO_ROUND[t.team.id].gained,
  checkpoint: DEMO_ROUND[t.team.id].checkpoint,
}));

const finalTeams: DemoTeam[] = [
  { ...afterRound[0], points: 120 },
  { ...afterRound[1], points: 105 },
  { ...afterRound[2], points: 95 },
  { ...afterRound[3], points: 80 },
  { ...afterRound[4], points: 70 },
];

const buzzOrder = [DEMO_TEAMS[1], DEMO_TEAMS[0], DEMO_TEAMS[2], DEMO_TEAMS[3]];

/** Clickable static version of the projector screens. The live state machine replaces this in milestone 5. */
export function HostDemo({ pin }: { pin: Promise<string> }) {
  const gamePin = use(pin);
  const [screen, setScreen] = useState<Screen>("lobby");

  const climb = (phase: "question" | "reveal" | "buzzer") => (
    <HostClimb
      phase={phase}
      question={DEMO_QUESTION}
      teams={phase === "reveal" ? afterRound : DEMO_TEAMS}
      buzzOrder={buzzOrder}
      gained={Object.fromEntries(Object.entries(DEMO_ROUND).map(([id, r]) => [id, r.gained]))}
      secondsLeft={14}
      onReveal={() => setScreen("reveal")}
      onNextQuestion={() => setScreen("question")}
      onStorm={() => setScreen("storm")}
    />
  );

  return (
    <>
      <HostStage className={screen === "storm" ? "bg-[#DDE3EE]" : "bg-page"}>
        {screen === "lobby" && <HostLobby pin={gamePin} teams={DEMO_TEAMS} onStart={() => setScreen("supplies")} />}
        {screen === "supplies" && <HostSupplies teams={DEMO_TEAMS} timeLeft="4:12" onClose={() => setScreen("question")} />}
        {(screen === "question" || screen === "reveal" || screen === "buzzer") && climb(screen)}
        {screen === "storm" && (
          <HostStorm
            card={DEMO_STORM}
            cardNumber={1}
            cardTotal={3}
            teams={afterRound}
            timeLeft="1:37"
            onFinalAscent={() => setScreen("question")}
            onResults={() => setScreen("summit")}
          />
        )}
        {screen === "summit" && <HostSummit teams={finalTeams} onPlanVote={() => setScreen("pledge")} />}
        {screen === "pledge" && <HostPledge plansMade={17} climbers={DEMO_CLIMBERS} onEnd={() => setScreen("lobby")} />}
      </HostStage>
      <DemoNav screens={SCREENS} current={screen} onChange={setScreen} />
    </>
  );
}

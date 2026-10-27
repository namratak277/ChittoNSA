"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { HostStage } from "@/components/layout/HostStage";
import { ANSWER_SLOTS } from "@/lib/answers";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { teamOf, type PublicQuestion, type QuestionRow, type SessionState, type StormCardRow } from "@/lib/db";
import { afterFact, questionLabel, revealTitle, stageTeams } from "@/lib/stage";
import { getSupabase } from "@/lib/supabase";
import { SUPPLIES, suppliesCost } from "@/lib/supplies";
import { useSecondsLeft } from "@/lib/useCountdown";
import { useLiveSession } from "@/lib/useLiveSession";
import type { Maker } from "@/lib/useMaker";
import { SettingsProvider, type Settings } from "@/lib/useSettings";
import { useWakeLock } from "@/lib/useWakeLock";
import { MakerGate, MakerMessage } from "@/screens/maker/MakerGate";
import { HostClimb, type BuzzerState, type ClimbQuestion, type HostAction } from "./HostClimb";
import { HostLobby } from "./HostLobby";
import { HostPledge } from "./HostPledge";
import { HostStorm } from "./HostStorm";
import { HostSummit } from "./HostSummit";
import { HostSupplies } from "./HostSupplies";
import { Scorecard, type AwardReason } from "./Scorecard";

/** How long the supply shop timer runs (the host closes the shop). */
export const SHOP_SECONDS = 300;

type Lookup = { id: string } | "missing" | "not-yours" | null;
type QuestionStep = Pick<QuestionRow, "id" | "checkpoint" | "position" | "prompt">;
type StormStep = Pick<StormCardRow, "id" | "position">;
/** One stop in the night: a question, or the Storm Zone event. */
type Step = { kind: "question"; id: string; checkpoint: number } | { kind: "storm"; id: string };
interface AnswerRow {
  team_id: string;
  option_index: number;
  correct: boolean;
}

/** m:ss */
const clock = (s: number | null) => (s === null ? "–" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

function climbQuestion(q: PublicQuestion): ClimbQuestion {
  const fact = afterFact(q);
  return {
    label: questionLabel(q),
    prompt: q.prompt,
    options: q.options,
    correctIndex: q.correct_index ?? -1,
    revealTitle: revealTitle(q),
    trailFact: fact.text,
    factTitle: fact.title,
    teamCounts: q.team_counts ?? [],
  };
}

/** The projector for a live session. Only the maker who opened it can run it. */
export function HostLive({ pin }: { pin: Promise<string> }) {
  const gamePin = use(pin);
  return <MakerGate>{(maker) => <Live pin={gamePin} maker={maker} />}</MakerGate>;
}

function Live({ pin, maker }: { pin: string; maker: Maker }) {
  const [lookup, setLookup] = useState<Lookup>(null);
  const [questions, setQuestions] = useState<QuestionStep[]>([]);
  const [storms, setStorms] = useState<StormStep[]>([]);
  const [awarded, setAwarded] = useState<Record<string, number>>({});
  const [awardsVersion, setAwardsVersion] = useState(0);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useWakeLock(true);

  useEffect(() => {
    getSupabase()!
      .from("sessions")
      .select("id, maker_id")
      .eq("pin", pin)
      .neq("state", "ENDED")
      .maybeSingle()
      .then(({ data }) => setLookup(!data ? "missing" : data.maker_id !== maker.id ? "not-yours" : { id: data.id }));
  }, [pin, maker.id]);

  const { session, teams } = useLiveSession(typeof lookup === "object" && lookup ? lookup.id : null);
  const sessionId = session?.id;
  const gameId = session?.game_id;
  const state = session?.state;
  const phaseStart = session?.phase_started_at ?? null;
  const q = session?.public_question ?? null;
  const card = session?.public_card ?? null;
  const buzzerQuestion = state === "QUESTION" && q?.mode === "buzzer" && q.options.length > 0;
  const talkItThrough = (state === "QUESTION" || state === "REVEAL") && q?.type === "final_scenario";

  // One countdown for whatever is on screen.
  const secondsLeft = useSecondsLeft(
    state === "SUPPLY_SHOP" || state === "STORM_EVENT" || state === "QUESTION" ? (buzzerQuestion ? q!.turn_started_at : phaseStart) : null,
    state === "SUPPLY_SHOP" ? SHOP_SECONDS : state === "STORM_EVENT" ? card?.seconds : q?.timer_seconds,
  );

  // The game's questions and storm cards, in play order.
  useEffect(() => {
    if (!gameId) return;
    const sb = getSupabase()!;
    sb.from("questions")
      .select("id, checkpoint, position, prompt")
      .eq("game_id", gameId)
      .order("checkpoint")
      .order("position")
      .then(({ data }) => setQuestions((data as QuestionStep[]) ?? []));
    sb.from("storm_cards")
      .select("id, position")
      .eq("game_id", gameId)
      .order("position")
      .then(({ data }) => setStorms((data as StormStep[]) ?? []));
  }, [gameId]);

  // Scorecard taps this round (Storm Zone, Final Ascent).
  const scoring = state === "STORM_EVENT" || talkItThrough;
  useEffect(() => {
    if (!sessionId || !phaseStart || !scoring) return;
    getSupabase()!
      .from("awards")
      .select("team_id, points")
      .eq("session_id", sessionId)
      .in("reason", ["plan", "reasoning", "backup", "teamwork"])
      .gte("created_at", phaseStart)
      .then(({ data }) => {
        const totals: Record<string, number> = {};
        for (const a of data ?? []) totals[a.team_id] = (totals[a.team_id] ?? 0) + a.points;
        setAwarded(totals);
      });
  }, [sessionId, phaseStart, scoring, awardsVersion]);

  // Buzzer mode: what the answering team picked, so the host can call it right or wrong.
  const questionId = q?.id;
  const answeredKey = teams.map((t) => t.answered_question_id ?? "").join();
  useEffect(() => {
    if (!sessionId || !questionId || !buzzerQuestion) return;
    getSupabase()!
      .from("answers")
      .select("team_id, option_index, correct")
      .eq("session_id", sessionId)
      .eq("question_id", questionId)
      .then(({ data }) => setAnswers((data as AnswerRow[]) ?? []));
  }, [sessionId, questionId, buzzerQuestion, answeredKey]);

  if (lookup === "missing")
    return (
      <MakerMessage>
        <h1 className="text-2xl font-extrabold">No open game with PIN {pin}</h1>
        <p>It may have ended. Open Base Camp again from your game to get a new PIN.</p>
        <Link href="/maker" className="font-bold text-flag-blue">
          ← My games
        </Link>
      </MakerMessage>
    );
  if (lookup === "not-yours")
    return (
      <MakerMessage>
        <h1 className="text-2xl font-extrabold">This game is hosted from another account</h1>
        <p>Sign in as the maker who opened it to run the projector.</p>
      </MakerMessage>
    );
  if (!session) return <MakerMessage>Opening Base Camp…</MakerMessage>;
  if (session.state === "ENDED")
    return (
      <MakerMessage>
        <h1 className="text-2xl font-extrabold">The climb is over. Thanks for hosting!</h1>
        <Link href="/maker" className="font-bold text-flag-blue">
          ← My games
        </Link>
      </MakerMessage>
    );

  /** Runs one host control on the server; phones follow the session row as it changes. */
  async function run(fn: string, args: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    const { error } = await getSupabase()!.rpc(fn, { p_session: session!.id, ...args });
    if (error) setError(error.message);
    setBusy(false);
  }
  const setState = (s: SessionState) => run("host_set_state", { p_state: s });
  const award = async (teamId: string, reason: AwardReason, points: number) => {
    await run("host_award", { p_team: teamId, p_reason: reason, p_points: points });
    setAwardsVersion((v) => v + 1);
  };
  const resetAwards = async () => {
    await run("host_reset_awards");
    setAwardsVersion((v) => v + 1);
  };

  // The night's plan: Checkpoints 1–3 questions, the Storm Zone event, then the Final Ascent.
  const questionSteps = questions.map((x): Step => ({ kind: "question", id: x.id, checkpoint: x.checkpoint }));
  const plan: Step[] = [
    ...questionSteps.filter((s) => s.kind === "question" && s.checkpoint <= 3),
    ...(storms[0] ? [{ kind: "storm", id: storms[0].id } as Step] : []),
    ...questionSteps.filter((s) => s.kind === "question" && s.checkpoint === 4),
  ];
  const here =
    session.state === "STORM_EVENT" ? plan.findIndex((s) => s.kind === "storm") : plan.findIndex((s) => s.id === session.current_question_id);
  const nextStep = plan[here + 1];

  const goTo = (step: Step) =>
    step.kind === "question" ? run("host_start_question", { p_question: step.id }) : run("host_start_storm", { p_card: step.id });
  const stepLabel = (step: Step) => {
    if (step.kind === "storm") return "Next: Storm Zone event";
    const current = session.state === "STORM_EVENT" ? 3 : q?.checkpoint;
    return step.checkpoint !== current ? `Next: ${CHECKPOINTS[step.checkpoint - 1].name}` : "Next question";
  };
  const forward: HostAction[] = [];
  if (nextStep) forward.push({ label: stepLabel(nextStep), onClick: () => goTo(nextStep) });
  forward.push({ label: nextStep ? "Skip to Summit Champions" : "Show Summit Champions", onClick: () => setState("RESULTS") });

  const stage = stageTeams(teams, session);
  const climbers = teams.reduce((n, t) => n + t.members, 0);
  const scoreTeams = teams.map((t) => ({ key: t.id, team: teamOf(t) }));
  const scorecard = <Scorecard teams={scoreTeams} awarded={awarded} onAward={award} onReset={resetAwards} busy={busy} />;

  let buzzer: BuzzerState | undefined;
  if (buzzerQuestion && q) {
    const byKey = (key: string) => stage.find((t) => t.team.id === key)!;
    const order = q.buzz.map(byKey).filter(Boolean);
    const turnRow = teams.find((t) => t.team_key === q.turn_team);
    const pick = turnRow && answers.find((a) => a.team_id === turnRow.id);
    buzzer = {
      order,
      turn: q.turn_team ? q.buzz.indexOf(q.turn_team) : -1,
      missed: q.missed.length,
      solving: teams.length - q.buzz.length,
      secondsLeft: q.turn_team ? secondsLeft : null,
      picked: pick ? `${ANSWER_SLOTS[pick.option_index].letter} · ${q.options[pick.option_index]} (${pick.correct ? "right" : "wrong"})` : null,
      onRight: () => run("host_reveal"),
      onWrong: () => run("host_next_turn"),
    };
  }

  // Storm Zone: who the helpful supply paid off for, and which card comes next.
  let supplyNote: string | undefined;
  if (card?.helpful_supply) {
    const supply = SUPPLIES.find((s) => s.id === card.helpful_supply)!;
    const lucky = teams.filter((t) => t.supplies.includes(card.helpful_supply!)).map((t) => t.name);
    supplyNote = lucky.length
      ? `${supply.name} helped! +5 for ${lucky.join(", ")}. Two minutes to talk, then one person explains your plan.`
      : `A ${supply.name.toLowerCase()} would have helped here. Two minutes to talk, then one person explains your plan.`;
  }
  const cardIndex = storms.findIndex((s) => s.id === card?.id);
  const nextCard = storms[cardIndex + 1];
  const stormNext: HostAction[] = [...forward];
  if (nextCard) stormNext.splice(1, 0, { label: "Draw another card", onClick: () => run("host_start_storm", { p_card: nextCard.id }) });

  const firstQuestion = plan.find((s) => s.kind === "question");

  return (
    <SettingsProvider value={session.settings as Partial<Settings>}>
      <HostStage className={session.state === "STORM_EVENT" ? "bg-[#DDE3EE]" : "bg-page"}>
        {session.state === "LOBBY" && (
          <HostLobby pin={session.pin} teams={stage} starting={busy || plan.length === 0} onStart={() => run("host_open_shop")} />
        )}
        {session.state === "SUPPLY_SHOP" && (
          <HostSupplies
            teams={teams.map((t) => ({ team: teamOf(t), supplySpent: suppliesCost(t.supplies), packed: t.supplies_locked }))}
            timeLeft={clock(secondsLeft)}
            nextQuestion={questions.find((x) => x.id === firstQuestion?.id)?.prompt}
            onClose={() => plan[0] && goTo(plan[0])}
            busy={busy}
          />
        )}
        {(session.state === "QUESTION" || session.state === "REVEAL") && q && (
          <HostClimb
            phase={session.state === "REVEAL" ? "reveal" : buzzer ? "buzzer" : "question"}
            question={climbQuestion(q)}
            teams={stage}
            buzzer={buzzer}
            scorecard={talkItThrough ? scorecard : undefined}
            gained={q.gained}
            secondsLeft={secondsLeft}
            answered={teams.filter((t) => t.answered_question_id === q.id).length}
            onReveal={() => run("host_reveal")}
            next={forward}
            busy={busy}
          />
        )}
        {session.state === "STORM_EVENT" && card && (
          <HostStorm
            card={card}
            cardNumber={card.number}
            cardTotal={card.total}
            teams={scoreTeams}
            timeLeft={clock(secondsLeft)}
            supplyNote={supplyNote}
            awarded={awarded}
            onAward={award}
            onReset={resetAwards}
            next={stormNext}
            busy={busy}
          />
        )}
        {session.state === "RESULTS" && <HostSummit teams={stage} onPlanVote={() => setState("VOTING_PLAN")} />}
        {session.state === "VOTING_PLAN" && <HostPledge plansMade={session.voting_plans} climbers={climbers} onEnd={() => setState("ENDED")} />}
        {error && (
          <p role="alert" className="absolute inset-x-0 top-0 bg-flag-red px-6 py-2 text-center text-lg font-bold text-white">
            {error}
          </p>
        )}
      </HostStage>
    </SettingsProvider>
  );
}

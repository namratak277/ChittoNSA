"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import seed from "../../../content/seed.json";
import { FLAG } from "@/lib/colors";
import { isWritten, seedContent, type GameRow, type Mode, type QuestionRow } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";
import type { Maker } from "@/lib/useMaker";
import { MakerGate } from "./MakerGate";
import { MakerSidebarShell } from "./MakerShell";

type GameCard = Pick<GameRow, "id" | "title" | "default_mode" | "updated_at"> & {
  questions: Pick<QuestionRow, "type" | "prompt" | "options" | "correct_index">[];
};

const STRIPES = [FLAG.blue, FLAG.red, FLAG.greenDark, FLAG.yellow];
const MODE_CHIP: Record<Mode, { label: string; bg: string }> = {
  buttons: { label: "Buttons mode", bg: "#DBE6FF" },
  buzzer: { label: "Buzzer mode", bg: "#FDE2E2" },
};

interface LastNight {
  climbers: number;
  plans: number;
  rightPct: number | null;
  winner: string;
}

const action = "flex min-h-11 grow items-center justify-center rounded-[10px] text-base no-underline";

const GAMES_SELECT = "id, title, default_mode, updated_at, questions(type, prompt, options, correct_index)";

/** A game filled with the questions and storm card from /content/seed.json. Returns the new game's id. */
async function createSeededGame(title: string, mode: Mode = "buttons") {
  const sb = getSupabase()!;
  const { data, error } = await sb.from("games").insert({ title, default_mode: mode }).select("id").single();
  if (error) throw error;
  const { questions, stormCards } = seedContent(data.id);
  const [q, s] = await Promise.all([sb.from("questions").insert(questions), sb.from("storm_cards").insert(stormCards)]);
  if (q.error || s.error) throw q.error ?? s.error;
  return data.id as string;
}

/** My games (design-reference/Maker-Dashboard.dc.html). */
export function MakerDashboard() {
  return <MakerGate>{(maker) => <Dashboard maker={maker} />}</MakerGate>;
}

function Dashboard({ maker }: { maker: Maker }) {
  const router = useRouter();
  const [games, setGames] = useState<GameCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [lastNight, setLastNight] = useState<LastNight | null>(null);

  // Stats from the most recent game night that started. Sessions are readable by anyone with
  // the PIN, so filter to this maker's own.
  useEffect(() => {
    const sb = getSupabase()!;
    sb.from("sessions")
      .select("id, voting_plans, teams(name, points, members)")
      .eq("maker_id", maker.id)
      .not("started_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) return;
        const teams = data.teams as { name: string; points: number; members: number }[];
        const { data: answers } = await sb.from("answers").select("correct").eq("session_id", data.id);
        const right = answers?.filter((a) => a.correct).length ?? 0;
        setLastNight({
          climbers: teams.reduce((n, t) => n + t.members, 0),
          plans: data.voting_plans,
          rightPct: answers?.length ? Math.round((right / answers.length) * 100) : null,
          winner: [...teams].sort((a, b) => b.points - a.points)[0]?.name ?? "–",
        });
      });
  }, [maker.id]);

  // First visit with no games: make the ready-to-play voting game so it can be hosted straight away.
  // The ref stops React's double effect run in development from making two copies.
  const autoMade = useRef(false);
  useEffect(() => {
    const sb = getSupabase()!;
    const load = () => sb.from("games").select(GAMES_SELECT).order("updated_at", { ascending: false });
    load().then(async ({ data, error }) => {
      if (error) return setError(error.message);
      if (data.length === 0 && !autoMade.current) {
        autoMade.current = true;
        try {
          await createSeededGame(seed.game.title, seed.game.default_mode as Mode);
        } catch (e) {
          return setError((e as Error).message);
        }
        const again = await load();
        if (again.error) return setError(again.error.message);
        return setGames(again.data as GameCard[]);
      }
      setGames(data as GameCard[]);
    });
  }, []);

  async function newGame() {
    setCreating(true);
    setError(null);
    try {
      router.push(`/maker/games/${await createSeededGame(seed.game.title, seed.game.default_mode as Mode)}`);
    } catch (e) {
      setError((e as Error).message);
      setCreating(false);
    }
  }

  // Questions, storm cards and past game nights go with it (the database cascades the delete).
  async function deleteGame(game: GameCard) {
    if (!confirm(`Delete "${game.title}"? Its questions and past game-night results are deleted too.`)) return;
    setError(null);
    const { error } = await getSupabase()!.from("games").delete().eq("id", game.id);
    if (error) return setError(error.message);
    setGames((gs) => gs?.filter((g) => g.id !== game.id) ?? null);
  }

  return (
    <MakerSidebarShell maker={maker} current="games">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">My games</h1>
          <p className="text-[17px] text-body">Only you can edit these. Players join with the PIN when you host.</p>
        </div>
        <button
          type="button"
          onClick={newGame}
          disabled={creating}
          className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-0 bg-flag-red px-[22px] text-lg font-extrabold text-white disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 4 V20 M4 12 H20" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          {creating ? "Making…" : "New game"}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border-2 border-flag-red bg-white px-4 py-3 font-bold text-flag-red">
          {error}
        </p>
      )}

      {games === null && !error && <p className="text-body">Loading your games…</p>}

      {games?.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-[#8A86A0] bg-white px-6 py-8 text-center text-lg text-body">
          No games yet. Press <b>New game</b> to make {seed.game.title} with every question ready to play.
        </p>
      )}

      {games && games.length > 0 && (
        <ul className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          {games.map((g, i) => {
            const written = g.questions.filter(isWritten).length;
            const total = g.questions.length;
            const draft = total === 0 || written < total;
            const chip = draft ? { label: "Draft", bg: "#EEECF4" } : MODE_CHIP[g.default_mode];
            const edited = new Date(g.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
            return (
              <li
                key={g.id}
                className={`flex flex-col gap-2 rounded-2xl bg-white p-[18px] ${draft ? "border-2 border-dashed border-[#8A86A0]" : "border-2 border-ink"}`}
              >
                <div className="h-2 rounded" style={{ background: STRIPES[i % STRIPES.length] }} aria-hidden />
                <h2 className="text-[21px] font-extrabold leading-tight">{g.title}</h2>
                <p className="text-[15px] text-body">
                  {draft ? `${written} of ${total} questions written · draft` : `${total} questions`} · edited {edited}
                </p>
                <p>
                  <span className="rounded-full px-2.5 py-0.5 text-sm font-bold" style={{ background: chip.bg }}>
                    {chip.label}
                  </span>
                </p>
                <div className="mt-1.5 flex gap-2">
                  <Link href={`/maker/games/${g.id}`} className={`${action} border-2 border-ink font-bold text-ink`}>
                    {draft ? "Keep writing" : "Edit"}
                  </Link>
                  {!draft && (
                    <Link href={`/maker/games/${g.id}/host`} className={`${action} bg-ink font-extrabold text-white`}>
                      Host
                    </Link>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteGame(g)}
                  className="min-h-11 cursor-pointer self-start rounded-[10px] px-1 text-[15px] font-bold text-flag-red underline"
                >
                  Delete game
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {lastNight && (
        <section aria-label="Last game night" className="flex flex-wrap items-center gap-x-10 gap-y-3 rounded-2xl border-2 border-ink bg-white px-[22px] py-[18px]">
          <h2 className="text-xl font-extrabold">Last game night</h2>
          <p className="text-[17px]">
            <b className="text-[26px]">{lastNight.climbers}</b> climbers
          </p>
          <p className="text-[17px]">
            <b className="text-[26px]">{lastNight.plans}</b> voting plans made
          </p>
          {lastNight.rightPct !== null && (
            <p className="text-[17px]">
              <b className="text-[26px]">{lastNight.rightPct}%</b> right answers
            </p>
          )}
          <p className="text-[17px]">
            Summit Champions: <b>{lastNight.winner}</b>
          </p>
        </section>
      )}
    </MakerSidebarShell>
  );
}

"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ANSWER_SLOTS } from "@/lib/answers";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { FLAG } from "@/lib/colors";
import { isWritten, type QuestionRow, type QuestionType, type StormCardRow, type Topic } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";
import { SUPPLIES, type SupplyId } from "@/lib/supplies";
import { MakerGate, MakerMessage } from "./MakerGate";
import { MakerTopBarShell } from "./MakerShell";

type Selection = { kind: "question"; id: string } | { kind: "storm" };
type Status = "loading" | "missing" | "saved" | "dirty" | "saving" | { error: string };

const TOPIC_DOT: Record<Topic, string> = { nepal: FLAG.red, voting: FLAG.blue };
const TYPES: { id: QuestionType; label: string }[] = [
  { id: "multiple_choice", label: "Question · 4 answers" },
  { id: "info_cards", label: "Info cards · pick the one to trust" },
  { id: "final_scenario", label: "Final scenario · host scores" },
];
const TIMERS = [10, 20, 30, 60, 120];
const QUESTION_CHECKPOINTS = CHECKPOINTS.filter((c) => c.order <= 4);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const field = "rounded-xl border-2 border-ink bg-white";
const label = "text-sm font-extrabold";
const CHIP = "polygon(0 0, 100% 0, 100% 84%, 75% 100%, 50% 84%, 25% 100%, 0 84%)";

/** Answers to keep when a question changes type. */
function optionsFor(type: QuestionType, prev: string[]) {
  if (type === "final_scenario") return [];
  const n = type === "multiple_choice" ? 4 : 3;
  return Array.from({ length: n }, (_, i) => prev[i] ?? "");
}

function blankQuestion(gameId: string, checkpoint: QuestionRow["checkpoint"]): QuestionRow {
  return {
    id: crypto.randomUUID(),
    game_id: gameId,
    checkpoint,
    position: 0,
    type: "multiple_choice",
    topic: "nepal",
    prompt: "",
    options: ["", "", "", ""],
    correct_index: 0,
    reveal_title: null,
    trail_fact: null,
    timer_seconds: 20,
  };
}

/** Deletes a game's rows that are no longer in the builder. */
function removeMissing(sb: SupabaseClient, table: "questions" | "storm_cards", gameId: string, keep: string[]) {
  const query = sb.from(table).delete().eq("game_id", gameId);
  return keep.length ? query.not("id", "in", `(${keep.join(",")})`) : query;
}

/** Question builder (design-reference/Maker-Builder.dc.html). */
export function MakerBuilder({ gameId }: { gameId: Promise<string> }) {
  const id = use(gameId);
  return <MakerGate>{() => <Builder id={id} />}</MakerGate>;
}

function Builder({ id }: { id: string }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [storms, setStorms] = useState<StormCardRow[]>([]);
  const [sel, setSel] = useState<Selection | null>(null);
  const [status, setStatus] = useState<Status>(UUID.test(id) ? "loading" : "missing");
  // Bumped on every edit, so a save that finishes after a newer edit leaves the page marked unsaved.
  const edits = useRef(0);

  useEffect(() => {
    if (!UUID.test(id)) return;
    const sb = getSupabase()!;
    Promise.all([
      sb.from("games").select("title").eq("id", id).maybeSingle(),
      sb.from("questions").select("*").eq("game_id", id).order("checkpoint").order("position"),
      sb.from("storm_cards").select("*").eq("game_id", id).order("position"),
    ]).then(([g, q, s]) => {
      const error = g.error ?? q.error ?? s.error;
      if (error) return setStatus({ error: error.message });
      if (!g.data) return setStatus("missing");
      const qs = q.data as QuestionRow[];
      setTitle(g.data.title);
      setQuestions(qs);
      setStorms(s.data as StormCardRow[]);
      setSel(qs[0] ? { kind: "question", id: qs[0].id } : { kind: "storm" });
      setStatus("saved");
    });
  }, [id]);

  const dirty = status === "dirty" || typeof status === "object";
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Questions in play order: by checkpoint, then the order they were added.
  const ordered = useMemo(() => [...questions].sort((a, b) => a.checkpoint - b.checkpoint), [questions]);

  if (status === "loading") return <MakerMessage>Loading game…</MakerMessage>;
  if (status === "missing")
    return (
      <MakerMessage>
        <h1 className="text-2xl font-extrabold">We couldn&apos;t find that game</h1>
        <p>It may have been deleted, or it belongs to another maker.</p>
        <Link href="/maker" className="font-bold text-flag-blue">
          ← Back to My games
        </Link>
      </MakerMessage>
    );

  const touch = () => {
    edits.current += 1;
    setStatus("dirty");
  };
  const updateQ = (qid: string, patch: Partial<QuestionRow>) => {
    setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, ...patch } : q)));
    touch();
  };
  const updateStorm = (sid: string, patch: Partial<StormCardRow>) => {
    setStorms((cs) => cs.map((c) => (c.id === sid ? { ...c, ...patch } : c)));
    touch();
  };

  const current = sel?.kind === "question" ? questions.find((q) => q.id === sel.id) : undefined;

  function addQuestion() {
    const q = blankQuestion(id, current?.checkpoint ?? 2);
    setQuestions((qs) => [...qs, q]);
    setSel({ kind: "question", id: q.id });
    touch();
  }

  function deleteQuestion(q: QuestionRow) {
    if (!window.confirm(`Delete question ${ordered.indexOf(q) + 1}? It's removed when you save.`)) return;
    const rest = ordered.filter((x) => x.id !== q.id);
    setQuestions((qs) => qs.filter((x) => x.id !== q.id));
    const next = rest[Math.min(ordered.indexOf(q), rest.length - 1)];
    setSel(next ? { kind: "question", id: next.id } : { kind: "storm" });
    touch();
  }

  async function save() {
    const sb = getSupabase()!;
    const version = edits.current;
    setStatus("saving");
    const qs = ordered.map((q, i) => ({ ...q, position: i }));
    const cs = storms.map((c, i) => ({ ...c, position: i }));
    const results = await Promise.all([
      sb.from("games").update({ title: title.trim() || "Untitled game", updated_at: new Date().toISOString() }).eq("id", id),
      removeMissing(sb, "questions", id, qs.map((q) => q.id)),
      removeMissing(sb, "storm_cards", id, cs.map((c) => c.id)),
      qs.length ? sb.from("questions").upsert(qs) : null,
      cs.length ? sb.from("storm_cards").upsert(cs) : null,
    ]);
    const error = results.find((r) => r?.error)?.error;
    if (error) setStatus({ error: error.message });
    else setStatus(edits.current === version ? "saved" : "dirty");
  }

  const statusText =
    typeof status === "object" ? `Couldn't save: ${status.error}` : { saved: "Saved", dirty: "Unsaved changes", saving: "Saving…" }[status];

  return (
    <MakerTopBarShell
      title={title || "Untitled game"}
      status={statusText}
      actions={
        <>
          <button
            type="button"
            onClick={save}
            disabled={status === "saving" || status === "saved"}
            className="min-h-11 cursor-pointer rounded-[10px] border-2 border-white bg-transparent px-[18px] text-base font-bold text-white disabled:cursor-default disabled:opacity-60"
          >
            Save
          </button>
          <Link
            href={`/maker/games/${id}/host`}
            className="flex min-h-11 items-center rounded-[10px] bg-flag-red px-[18px] text-base font-extrabold text-white no-underline"
          >
            Host this game
          </Link>
        </>
      }
    >
      <div className="flex min-h-0 grow flex-col md:flex-row">
        <nav aria-label="Questions" className="flex shrink-0 flex-col gap-2 border-b-2 border-[#E2DED3] px-3.5 py-[18px] md:w-[290px] md:border-b-0 md:border-r-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="gtitle" className={label}>
              Game title
            </label>
            <input
              id="gtitle"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                touch();
              }}
              className={`${field} h-11 px-3 text-base`}
            />
          </div>
          <p className="mt-2 text-sm font-extrabold tracking-[1px] text-body">
            4 CHECKPOINTS · {questions.length} QUESTIONS
          </p>
          <ol className="flex flex-col gap-2">
            {QUESTION_CHECKPOINTS.map((cp) => (
              <li key={cp.order}>
                <p className="px-1 text-[13px] font-extrabold uppercase tracking-[1px] text-body">
                  {cp.order} · {cp.name}
                </p>
                <ol className="flex flex-col gap-1">
                  {ordered
                    .filter((q) => q.checkpoint === cp.order)
                    .map((q) => (
                      <li key={q.id}>
                        <NavItem
                          number={ordered.indexOf(q) + 1}
                          text={q.prompt.trim() || "New question"}
                          draft={!isWritten(q)}
                          selected={sel?.kind === "question" && sel.id === q.id}
                          onSelect={() => setSel({ kind: "question", id: q.id })}
                          tag={
                            q.type === "final_scenario" ? (
                              <span className="text-xs font-extrabold text-flag-red">FINAL</span>
                            ) : (
                              <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ background: TOPIC_DOT[q.topic] }}
                                aria-label={q.topic === "nepal" ? "Nepal culture" : "Voting"}
                              />
                            )
                          }
                        />
                      </li>
                    ))}
                  {cp.order === 3 && (
                    <li>
                      <NavItem
                        number="⚡"
                        text={`Storm event cards (${storms.length})`}
                        draft={storms.length === 0}
                        selected={sel?.kind === "storm"}
                        onSelect={() => setSel({ kind: "storm" })}
                        tag={<span className="text-xs font-extrabold text-flag-green-dark">EVENT</span>}
                      />
                    </li>
                  )}
                </ol>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={addQuestion}
            className="mt-1.5 min-h-11 cursor-pointer rounded-[10px] border-2 border-dashed border-[#8A86A0] bg-transparent text-base font-bold"
          >
            + Add question
          </button>
          <p className="mt-auto flex gap-3 pt-3 text-[13px] text-body">
            <span>
              <span className="inline-block size-2.5 rounded-full bg-flag-red" aria-hidden /> Nepal culture
            </span>
            <span>
              <span className="inline-block size-2.5 rounded-full bg-flag-blue" aria-hidden /> Voting
            </span>
          </p>
        </nav>

        {current && (
          <QuestionEditor
            key={current.id}
            q={current}
            number={ordered.indexOf(current) + 1}
            onChange={(patch) => updateQ(current.id, patch)}
            onDelete={() => deleteQuestion(current)}
          />
        )}
        {sel?.kind === "storm" && (
          <StormEditor
            cards={storms}
            onChange={updateStorm}
            onAdd={() => {
              setStorms((cs) => [...cs, { id: crypto.randomUUID(), game_id: id, position: cs.length, title: "", body: "", helpful_supply: null }]);
              touch();
            }}
            onDelete={(sid) => {
              setStorms((cs) => cs.filter((c) => c.id !== sid));
              touch();
            }}
          />
        )}
      </div>
    </MakerTopBarShell>
  );
}

function NavItem({ number, text, tag, draft, selected, onSelect }: { number: React.ReactNode; text: string; tag: React.ReactNode; draft: boolean; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-current={selected ? "true" : undefined}
      onClick={onSelect}
      className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[15px] ${
        selected ? "border-2 border-ink bg-white font-bold" : "border-2 border-transparent bg-transparent"
      }`}
    >
      <b>{number}</b>
      <span className={`min-w-0 grow truncate ${draft ? "italic text-body" : ""}`}>{text}</span>
      {draft && <span className="sr-only">(not finished)</span>}
      {tag}
    </button>
  );
}

function QuestionEditor({ q, number, onChange, onDelete }: { q: QuestionRow; number: number; onChange: (patch: Partial<QuestionRow>) => void; onDelete: () => void }) {
  const cards = q.type === "info_cards";
  const setOption = (i: number, value: string) => onChange({ options: q.options.map((o, j) => (j === i ? value : o)) });
  const removeOption = (i: number) => {
    const correct = q.correct_index ?? 0;
    onChange({ options: q.options.filter((_, j) => j !== i), correct_index: correct === i ? 0 : correct > i ? correct - 1 : correct });
  };

  return (
    <section aria-label={`Question ${number}`} className="flex min-w-0 grow flex-col gap-3.5 px-7 py-[22px]">
      <div className="flex flex-col gap-1">
        <label htmlFor="qtext" className={label}>
          Question {number}
        </label>
        <textarea
          id="qtext"
          rows={2}
          value={q.prompt}
          placeholder={q.type === "final_scenario" ? "One day left before the election. Explain your full plan and your backup." : "Type the question"}
          onChange={(e) => onChange({ prompt: e.target.value })}
          className={`${field} resize-none px-3.5 py-2.5 text-lg`}
        />
      </div>

      <div className="flex flex-wrap gap-3.5">
        <div className="flex w-[200px] flex-col gap-1">
          <label htmlFor="qcheckpoint" className={label}>
            Checkpoint
          </label>
          <select
            id="qcheckpoint"
            value={q.checkpoint}
            onChange={(e) => onChange({ checkpoint: Number(e.target.value) as QuestionRow["checkpoint"] })}
            className={`${field} h-[50px] px-2.5 text-base`}
          >
            {QUESTION_CHECKPOINTS.map((c) => (
              <option key={c.order} value={c.order}>
                {c.order} · {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[280px] flex-col gap-1">
          <label htmlFor="qtype" className={label}>
            Kind
          </label>
          <select
            id="qtype"
            value={q.type}
            onChange={(e) => {
              const type = e.target.value as QuestionType;
              const options = optionsFor(type, q.options);
              const correct = type === "final_scenario" ? null : Math.min(q.correct_index ?? 0, options.length - 1);
              onChange({ type, options, correct_index: correct });
            }}
            className={`${field} h-[50px] px-2.5 text-base`}
          >
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[180px] flex-col gap-1">
          <label htmlFor="qtopic" className={label}>
            Topic
          </label>
          <select id="qtopic" value={q.topic} onChange={(e) => onChange({ topic: e.target.value as Topic })} className={`${field} h-[50px] px-2.5 text-base`}>
            <option value="nepal">Nepali culture</option>
            <option value="voting">Voting in the U.S.</option>
          </select>
        </div>
        <div className="flex w-[130px] flex-col gap-1">
          <label htmlFor="qtime" className={label}>
            Timer
          </label>
          <select id="qtime" value={q.timer_seconds} onChange={(e) => onChange({ timer_seconds: Number(e.target.value) })} className={`${field} h-[50px] px-2.5 text-base`}>
            {(TIMERS.includes(q.timer_seconds) ? TIMERS : [...TIMERS, q.timer_seconds].sort((a, b) => a - b)).map((s) => (
              <option key={s} value={s}>
                {s < 60 ? `${s} sec` : `${s / 60} min`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {q.type === "final_scenario" ? (
        <p className="rounded-xl border-2 border-dashed border-[#8A86A0] bg-white px-4 py-3 text-base text-body">
          Teams talk it through and one person explains the plan. You award points on the projector; every team gets +10 for completing the
          Final Ascent.
        </p>
      ) : (
        <fieldset className="flex flex-col gap-2.5">
          <legend className={`mb-2 ${label}`}>{cards ? "Info cards · mark the one to trust" : "Answers · mark the right one"}</legend>
          {q.options.map((option, i) => {
            const slot = ANSWER_SLOTS[i];
            const right = i === q.correct_index;
            return (
              <div key={slot.letter} className="flex items-center gap-3">
                <span
                  lang="ne"
                  aria-hidden
                  className="flex size-[46px] shrink-0 items-center justify-center text-2xl font-extrabold"
                  style={{ background: slot.bg, color: slot.fg, clipPath: CHIP }}
                >
                  {slot.letter}
                </span>
                <input
                  aria-label={`${cards ? "Card" : "Answer"} ${slot.letter}`}
                  value={option}
                  placeholder={cards ? ["Official: ncsbe.gov says…", "Outdated: last year's flyer says…", "Unverified social post says…"][i] : undefined}
                  onChange={(e) => setOption(i, e.target.value)}
                  className={`${field} h-[46px] min-w-0 grow px-3.5 text-[17px]`}
                />
                <button
                  type="button"
                  aria-pressed={right}
                  onClick={() => onChange({ correct_index: i })}
                  className={`min-h-[46px] w-[150px] shrink-0 cursor-pointer rounded-xl border-2 text-[15px] font-extrabold ${
                    right ? "border-flag-green-dark bg-flag-green-dark text-white" : "border-ink bg-white text-ink"
                  }`}
                >
                  {right ? (cards ? "Trust this ✓" : "Right answer ✓") : cards ? "Mark trusted" : "Mark right"}
                </button>
                {cards && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    disabled={q.options.length <= 2}
                    aria-label={`Remove card ${slot.letter}`}
                    className="min-h-[46px] w-11 shrink-0 cursor-pointer rounded-xl border-2 border-ink bg-white text-lg font-extrabold disabled:cursor-default disabled:opacity-30"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
          {cards && q.options.length < 4 && (
            <button
              type="button"
              onClick={() => onChange({ options: [...q.options, ""] })}
              className="min-h-11 w-fit cursor-pointer rounded-[10px] border-2 border-dashed border-[#8A86A0] bg-transparent px-4 text-base font-bold"
            >
              + Add card
            </button>
          )}
        </fieldset>
      )}

      {q.type !== "final_scenario" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="qreveal" className={label}>
            Reveal headline (optional)
          </label>
          <input
            id="qreveal"
            value={q.reveal_title ?? ""}
            placeholder="Dashain lasts 15 days"
            onChange={(e) => onChange({ reveal_title: e.target.value || null })}
            className={`${field} h-[46px] px-3.5 text-[17px]`}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="qfact" className={label}>
          {q.topic === "nepal" ? "Trail fact (shown after the reveal)" : "Note shown after the reveal (optional)"}
        </label>
        <textarea
          id="qfact"
          rows={2}
          value={q.trail_fact ?? ""}
          onChange={(e) => onChange({ trail_fact: e.target.value || null })}
          className={`${field} resize-none px-3.5 py-2.5 text-base`}
        />
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="mt-2 min-h-11 w-fit cursor-pointer rounded-[10px] border-2 border-flag-red bg-white px-4 text-base font-bold text-flag-red"
      >
        Delete question
      </button>
    </section>
  );
}

function StormEditor({
  cards,
  onChange,
  onAdd,
  onDelete,
}: {
  cards: StormCardRow[];
  onChange: (id: string, patch: Partial<StormCardRow>) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section aria-label="Storm event cards" className="flex min-w-0 grow flex-col gap-3.5 px-7 py-[22px]">
      <h2 className="text-2xl font-extrabold">Storm event cards</h2>
      <p className="text-base text-body">
        At the Storm Zone you draw one card. Teams get 2 minutes to discuss, then one person explains the plan and you award points. A team
        that packed the helpful supply earns a +5 bonus.
      </p>
      <ol className="flex flex-col gap-3.5">
        {cards.map((c, i) => (
          <li key={c.id} className="flex flex-col gap-2.5 rounded-2xl border-2 border-ink bg-white p-4">
            <div className="flex flex-col gap-1">
              <label htmlFor={`stitle-${c.id}`} className={label}>
                Card {i + 1} title
              </label>
              <input
                id={`stitle-${c.id}`}
                value={c.title}
                placeholder="Your planned trail is closed."
                onChange={(e) => onChange(c.id, { title: e.target.value })}
                className={`${field} h-[46px] px-3.5 text-[17px]`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`sbody-${c.id}`} className={label}>
                What happens
              </label>
              <textarea
                id={`sbody-${c.id}`}
                rows={2}
                value={c.body}
                onChange={(e) => onChange(c.id, { body: e.target.value })}
                className={`${field} resize-none px-3.5 py-2.5 text-base`}
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex w-[260px] flex-col gap-1">
                <label htmlFor={`ssupply-${c.id}`} className={label}>
                  Helpful supply (+5)
                </label>
                <select
                  id={`ssupply-${c.id}`}
                  value={c.helpful_supply ?? ""}
                  onChange={(e) => onChange(c.id, { helpful_supply: (e.target.value || null) as SupplyId | null })}
                  className={`${field} h-[46px] px-2.5 text-base`}
                >
                  <option value="">None</option>
                  {SUPPLIES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                className="ml-auto min-h-11 cursor-pointer rounded-[10px] border-2 border-flag-red bg-white px-4 text-base font-bold text-flag-red"
              >
                Delete card
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onAdd}
        className="min-h-11 w-fit cursor-pointer rounded-[10px] border-2 border-dashed border-[#8A86A0] bg-transparent px-4 text-base font-bold"
      >
        + Add storm card
      </button>
    </section>
  );
}

import Link from "next/link";
import { FLAG } from "@/lib/colors";
import { MakerSidebarShell } from "./MakerShell";

// Fake saved games until the database lands in milestone 3.
const GAMES = [
  { id: "demo", title: "Dashain & Democracy Night", meta: "12 questions · Nepal + voting · last hosted [DATE]", mode: "Buttons mode", modeBg: "#DBE6FF", stripe: FLAG.blue, draft: false },
  { id: "finals", title: "Nepal Culture Finals", meta: "10 questions · culture · never hosted", mode: "Buzzer mode", modeBg: "#FDE2E2", stripe: FLAG.red, draft: false },
  { id: "warmup", title: "Voting 101 Warm-up", meta: "6 of 8 questions written · draft", mode: "Draft", modeBg: "#EEECF4", stripe: FLAG.yellow, draft: true },
];

const LAST_NIGHT = { climbers: 41, plans: 28, rightPct: 74, winner: "Summit Seekers" };

const action = "flex min-h-11 grow items-center justify-center rounded-[10px] text-base no-underline";

/** My games (design-reference/Maker-Dashboard.dc.html). */
export function MakerDashboard() {
  return (
    <MakerSidebarShell current="games">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">My games</h1>
          <p className="text-[17px] text-body">Only you can edit these. Players join with the PIN when you host.</p>
        </div>
        <Link href="/maker/games/new" className="flex min-h-12 items-center gap-2 rounded-xl bg-flag-red px-[22px] text-lg font-extrabold text-white no-underline">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 4 V20 M4 12 H20" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          New game
        </Link>
      </div>

      <ul className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
        {GAMES.map((g) => (
          <li
            key={g.id}
            className={`flex flex-col gap-2 rounded-2xl bg-white p-[18px] ${g.draft ? "border-2 border-dashed border-[#8A86A0]" : "border-2 border-ink"}`}
          >
            <div className="h-2 rounded" style={{ background: g.stripe }} aria-hidden />
            <h2 className="text-[21px] font-extrabold leading-tight">{g.title}</h2>
            <p className="text-[15px] text-body">{g.meta}</p>
            <p>
              <span className="rounded-full px-2.5 py-0.5 text-sm font-bold" style={{ background: g.modeBg }}>
                {g.mode}
              </span>
            </p>
            <div className="mt-1.5 flex gap-2">
              <Link href={`/maker/games/${g.id}`} className={`${action} border-2 border-ink font-bold text-ink`}>
                {g.draft ? "Keep writing" : "Edit"}
              </Link>
              {!g.draft && (
                <Link href={`/maker/games/${g.id}/host`} className={`${action} bg-ink font-extrabold text-white`}>
                  Host
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section aria-label="Last game night" className="flex flex-wrap items-center gap-x-10 gap-y-3 rounded-2xl border-2 border-ink bg-white px-[22px] py-[18px]">
        <h2 className="text-xl font-extrabold">Last game night</h2>
        <p className="text-[17px]">
          <b className="text-[26px]">{LAST_NIGHT.climbers}</b> climbers
        </p>
        <p className="text-[17px]">
          <b className="text-[26px]">{LAST_NIGHT.plans}</b> voting plans made
        </p>
        <p className="text-[17px]">
          <b className="text-[26px]">{LAST_NIGHT.rightPct}%</b> right answers
        </p>
        <p className="text-[17px]">
          Summit Champions: <b>{LAST_NIGHT.winner}</b>
        </p>
      </section>
    </MakerSidebarShell>
  );
}

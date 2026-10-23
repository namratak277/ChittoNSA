import Link from "next/link";
import { PRAYER_FLAG_ORDER } from "@/lib/teams";

const NAV = [
  { key: "games", label: "My games", href: "/maker" },
  { key: "builder", label: "Question builder", href: "/maker/games/demo" },
  { key: "host", label: "Host a game", href: "/maker/games/demo/host" },
  { key: "results", label: "Results", href: "/maker" },
] as const;

type NavKey = (typeof NAV)[number]["key"];

// Fake signed-in maker until auth lands in milestone 3.
const MAKER = { name: "Maya", club: "[CLUB NAME]" };

/** Work-tool layout with a dark side bar (design-reference/Maker-Dashboard.dc.html). */
export function MakerSidebarShell({ current, children }: { current: NavKey; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-maker text-ink md:flex-row">
      <nav aria-label="Maker" className="flex shrink-0 flex-col gap-1.5 bg-ink px-5 py-6 text-white md:w-60 md:py-7">
        <div className="mb-1.5 grid w-fit grid-cols-5 gap-1" aria-hidden>
          {PRAYER_FLAG_ORDER.map((c) => (
            <div key={c} className="h-5 w-4" style={{ background: c }} />
          ))}
        </div>
        <p className="mb-4 text-xl font-extrabold">Chhito! · Maker</p>
        <ul className="flex flex-wrap gap-1.5 md:flex-col">
          {NAV.map((n) => (
            <li key={n.key}>
              <Link
                href={n.href}
                aria-current={n.key === current ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-[10px] px-3.5 text-[17px] no-underline ${
                  n.key === current ? "bg-[#3A3550] font-bold text-white" : "text-[#D9D6E4] hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto hidden items-center gap-2.5 border-t border-[#3A3550] pt-3.5 md:flex">
          <div className="flex size-10 items-center justify-center rounded-full bg-flag-red text-lg font-extrabold">{MAKER.name[0]}</div>
          <p className="text-[15px] leading-tight">
            {MAKER.name}
            <br />
            <span className="text-[#B9B5C9]">{MAKER.club}</span>
          </p>
        </div>
      </nav>
      <main className="flex min-w-0 grow flex-col gap-5 px-5 py-7 md:px-10 md:py-9">{children}</main>
    </div>
  );
}

/** Work-tool layout with a dark top bar, for editing one game (Maker-Builder / Maker-Host). */
export function MakerTopBarShell({ title, status, actions, children }: { title: string; status?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-maker text-ink">
      <header className="flex min-h-[68px] shrink-0 flex-wrap items-center gap-4 bg-ink px-6 py-2 text-white">
        <Link href="/maker" className="text-base text-[#D9D6E4] no-underline hover:text-white">
          ← My games
        </Link>
        <h1 className="text-[21px] font-extrabold">{title}</h1>
        {status && <span className="text-sm text-[#B9B5C9]">{status}</span>}
        <div className="ml-auto flex gap-2.5">{actions}</div>
      </header>
      {children}
    </div>
  );
}

export { MAKER };

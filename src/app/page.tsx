import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { DEMO_PIN } from "@/lib/demo";

const SECTIONS = [
  {
    title: "Players (phone)",
    links: [
      { href: "/play", label: "Join a live game" },
      { href: `/play/${DEMO_PIN}`, label: "Demo phone screens (fake data)" },
    ],
  },
  {
    title: "Host (projector)",
    links: [{ href: `/host/${DEMO_PIN}`, label: "Demo projector screens (fake data)" }],
  },
  {
    title: "Game makers (laptop)",
    links: [
      { href: "/maker/sign-in", label: "Sign in" },
      { href: "/maker", label: "My games (builder and host setup are inside)" },
    ],
  },
  {
    title: "Developer",
    links: [
      { href: "/dev/components", label: "Component gallery" },
      { href: "/dev/stage", label: "Projector stage test" },
    ],
  },
];

// Temporary index while the screens use fake data. Each screen has a "Demo screen" picker in the corner.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-5 py-10">
      <div className="flex items-center gap-4">
        <LogoMark size={110} />
        <div>
          <Wordmark size={52} />
          <p className="text-xl font-extrabold text-pine">Think fast. Climb fast. Vote.</p>
        </div>
      </div>
      <p className="text-lg text-body">
        Every screen is clickable with fake data. Use the buttons on each screen, or the <b>Demo screen</b> picker in the corner, to move
        through the game.
      </p>
      {SECTIONS.map((s) => (
        <section key={s.title} className="flex flex-col gap-2">
          <h2 className="text-xl font-extrabold">{s.title}</h2>
          <ul className="flex flex-wrap gap-2">
            {s.links.map((l) => (
              <li key={l.href}>
                <Button href={l.href} variant="outline" size="sm">
                  {l.label}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-sm text-body">
        Projector screens are 16:9. On a phone you&apos;ll see a notice first; tap <i>Show it anyway</i>, or see{" "}
        <Link href="/dev/stage" className="text-flag-blue">
          the stage test
        </Link>
        .
      </p>
    </main>
  );
}

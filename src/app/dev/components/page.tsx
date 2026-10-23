import type { Metadata } from "next";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { PrayerFlagBunting } from "@/components/brand/PrayerFlagBunting";
import { PrayerFlagStripe } from "@/components/brand/PrayerFlagStripe";
import { ClimberMarker } from "@/components/climbers/ClimberMarker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TimerRing } from "@/components/ui/TimerRing";
import { FLAG } from "@/lib/colors";
import { teamsFor } from "@/lib/teams";
import { FlagDemo, MountainDemo, SignpostDemo, StagePreview } from "../demos";

export const metadata: Metadata = { title: "Components · Chhito!" };

const SWATCHES = [
  ["flag-blue", "#1D4ED8"],
  ["flag-white", "#FFFFFF"],
  ["flag-red", "#DC2626"],
  ["flag-green", "#16A34A"],
  ["flag-green-dark", "#15803D"],
  ["flag-yellow", "#F2B705"],
  ["flag-orange", "#EA580C"],
  ["marigold", "#F2B705"],
  ["chili", "#E23D28"],
  ["pine", "#0E7C5A"],
  ["cream", "#FFF6DC"],
  ["ink", "#1E1B2E"],
  ["body", "#4A4660"],
  ["page", "#FFFDF8"],
  ["maker", "#F6F4EE"],
  ["glacier-lit", "#A9C8F7"],
  ["glacier-shadow", "#7FA6EC"],
  ["glacier-fold", "#6F9BE8"],
  ["glacier-foothill", "#8FB2EF"],
  ["glacier-haze", "#E3EDFC"],
  ["sun", "#FFF1C2"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export default function ComponentsPage() {
  const teams = teamsFor(6);
  return (
    <div className="min-h-dvh bg-page">
      <PrayerFlagStripe />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-8 sm:px-8">
        <header className="flex flex-col gap-1">
          <p className="text-sm font-extrabold tracking-[2px] text-chili">MILESTONE 1 · DEV ONLY</p>
          <h1 className="text-4xl font-extrabold">Component gallery</h1>
        </header>

        <Section title="Brand">
          <div className="flex flex-wrap items-center gap-6">
            <LogoMark size={160} />
            <div className="flex flex-col gap-2">
              <Wordmark size={72} />
              <p className="text-2xl font-extrabold text-pine">Think fast. Climb fast. Vote.</p>
              <p className="font-display text-5xl" lang="ne">
                नमस्ते! शिखर! कखगघ
              </p>
            </div>
          </div>
        </Section>

        <Section title="Colours">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
            {SWATCHES.map(([name, hex]) => (
              <div key={name} className="flex flex-col gap-1 text-sm">
                <div className="h-14 rounded-xl border-[3px] border-ink" style={{ background: hex }} />
                <b>{name}</b>
                <span className="text-body">{hex}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Climber markers (first player's style = team marker)">
          <div className="flex flex-col gap-4">
            {(["topi", "headlamp"] as const).map((style) => (
              <div key={style} className="flex flex-wrap gap-5">
                {teams.map((team) => (
                  <div key={team.id} className="flex w-24 flex-col items-center gap-1 text-center text-sm font-bold">
                    <ClimberMarker style={style} team={team} size={84} label={`${team.name}, ${style}`} />
                    {team.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Mountain + team markers">
          <p className="text-body">Teams group side by side at each stop and walk along the trail when they advance.</p>
          <MountainDemo />
        </Section>

        <Section title="Answers: prayer flags (projector)">
          <FlagDemo />
        </Section>

        <Section title="Answers: trail signposts (phone)">
          <SignpostDemo />
        </Section>

        <Section title="Prayer flags">
          <div className="max-w-[390px] overflow-hidden rounded-xl border-[3px] border-ink">
            <PrayerFlagStripe />
            <p className="p-4 text-body">Phone screen stripe</p>
          </div>
          <StagePreview scale={0.5}>
            <PrayerFlagBunting className="absolute left-0 top-0" />
          </StagePreview>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg">
              Start the climb
            </Button>
            <Button variant="ink">Reveal answer</Button>
            <Button variant="outline">Next rule</Button>
            <Button variant="success">Right → reveal</Button>
            <Button variant="outline" size="sm">
              Back
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button href="/" variant="ink">
              Link button
            </Button>
          </div>
        </Section>

        <Section title="Cards + timer">
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="flex flex-col gap-2">
              <p className="text-[15px] font-bold tracking-[1px] text-flag-red">TRAIL FACT</p>
              <p className="text-lg leading-snug">
                Families gather for Dashain, and elders give tika and blessings. It celebrates good winning over evil.
              </p>
            </Card>
            <Card variant="raised" className="flex flex-col gap-2">
              <p className="text-base font-extrabold tracking-[1px]">EVENT CARD 1 OF 3</p>
              <p className="text-3xl font-extrabold leading-tight">Your planned trail is closed.</p>
            </Card>
            <Card variant="ink" className="flex flex-col gap-2">
              <p className="text-sm font-extrabold tracking-[1px] text-marigold">THE VOTING LINK</p>
              <p className="text-lg font-bold leading-snug">&ldquo;You planned your climb. Now plan your vote.&rdquo;</p>
            </Card>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <TimerRing value={14} label="14 seconds left" />
            <TimerRing value="4:12" label="4 minutes 12 seconds left" color={FLAG.blue} size={84} />
            <TimerRing value="1:37" label="1 minute 37 seconds left" color="#B91C1C" size={80} />
          </div>
        </Section>
      </main>
    </div>
  );
}

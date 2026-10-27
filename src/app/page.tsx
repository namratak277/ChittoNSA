import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { Button } from "@/components/ui/Button";

// The front door: players join a game; club organisers sign in to build and host.
export default function Home() {
  return (
    <PhoneShell className="items-center justify-center gap-6 text-center">
      <LogoMark size={120} />
      <div>
        <Wordmark size={52} />
        <p className="text-xl font-extrabold text-pine">Think fast. Climb fast. Vote.</p>
      </div>
      <p className="max-w-sm text-lg text-body">Climb Mount Everest with your team, learn about Nepal, and make your plan to vote.</p>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button href="/play" variant="primary" size="lg">
          Join a game
        </Button>
        <Button href="/maker" variant="outline" size="md">
          Host a game (organisers)
        </Button>
      </div>
    </PhoneShell>
  );
}

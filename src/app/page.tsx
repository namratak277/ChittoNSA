import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

// Temporary index until milestone 2 adds the real routes.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-5 py-10">
      <LogoMark size={140} />
      <Wordmark size={64} />
      <p className="text-2xl font-extrabold text-pine">Think fast. Climb fast. Vote.</p>
      <p className="text-lg text-body">The game screens arrive in milestone 2. For now, see the shared components.</p>
      <div className="flex flex-wrap gap-3">
        <Button href="/dev/components" variant="primary">
          Component gallery
        </Button>
        <Button href="/dev/stage" variant="outline">
          Projector stage test
        </Button>
      </div>
    </main>
  );
}

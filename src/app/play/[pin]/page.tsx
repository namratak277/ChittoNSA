import type { Metadata } from "next";
import { Suspense } from "react";
import { DEMO_PIN } from "@/lib/demo";
import { PlayerDemo } from "@/screens/player/PlayerDemo";
import { PlayerLive } from "@/screens/player/PlayerLive";

export const metadata: Metadata = { title: "Play · Chhito!" };

// Opened from the QR code: the PIN is prefilled. Read inside Suspense so the shell can prerender.
export default function PlayWithPinPage({ params }: PageProps<"/play/[pin]">) {
  const pin = params.then((p) => p.pin);
  return (
    <Suspense fallback={null}>
      <PlayerScreen pin={pin} />
    </Suspense>
  );
}

// The demo PIN keeps the clickable fake-data screens for design review.
async function PlayerScreen({ pin }: { pin: Promise<string> }) {
  return (await pin) === DEMO_PIN ? <PlayerDemo pin={pin} /> : <PlayerLive pin={pin} />;
}

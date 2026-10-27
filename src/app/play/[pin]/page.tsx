import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayerLive } from "@/screens/player/PlayerLive";

export const metadata: Metadata = { title: "Play · Chhito!" };

// Opened from the QR code: the PIN is prefilled. Read inside Suspense so the shell can prerender.
export default function PlayWithPinPage({ params }: PageProps<"/play/[pin]">) {
  const pin = params.then((p) => p.pin);
  return (
    <Suspense fallback={null}>
      <PlayerLive pin={pin} />
    </Suspense>
  );
}

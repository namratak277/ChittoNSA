import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayerDemo } from "@/screens/player/PlayerDemo";

export const metadata: Metadata = { title: "Play · Chhito!" };

// Opened from the QR code: the PIN is prefilled. Read inside Suspense so the shell can prerender.
export default function PlayWithPinPage({ params }: PageProps<"/play/[pin]">) {
  return (
    <Suspense fallback={null}>
      <PlayerDemo pin={params.then((p) => p.pin)} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { DEMO_PIN } from "@/lib/demo";
import { HostDemo } from "@/screens/host/HostDemo";
import { HostLive } from "@/screens/host/HostLive";

export const metadata: Metadata = { title: "Host · Chhito!" };

// Not async: the pin is read inside the Suspense boundary so the page shell can prerender.
export default function HostPage({ params }: PageProps<"/host/[pin]">) {
  const pin = params.then((p) => p.pin);
  return (
    <Suspense fallback={null}>
      <HostScreen pin={pin} />
    </Suspense>
  );
}

// The demo PIN keeps the clickable fake-data screens for design review.
async function HostScreen({ pin }: { pin: Promise<string> }) {
  return (await pin) === DEMO_PIN ? <HostDemo pin={pin} /> : <HostLive pin={pin} />;
}

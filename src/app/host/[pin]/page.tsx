import type { Metadata } from "next";
import { Suspense } from "react";
import { HostLive } from "@/screens/host/HostLive";

export const metadata: Metadata = { title: "Host · Chhito!" };

// Not async: the pin is read inside the Suspense boundary so the page shell can prerender.
export default function HostPage({ params }: PageProps<"/host/[pin]">) {
  const pin = params.then((p) => p.pin);
  return (
    <Suspense fallback={null}>
      <HostLive pin={pin} />
    </Suspense>
  );
}

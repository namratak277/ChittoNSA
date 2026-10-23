import type { Metadata } from "next";
import { Suspense } from "react";
import { HostDemo } from "@/screens/host/HostDemo";

export const metadata: Metadata = { title: "Host · Chhito!" };

// Not async: the pin is read inside the Suspense boundary so the page shell can prerender.
export default function HostPage({ params }: PageProps<"/host/[pin]">) {
  return (
    <Suspense fallback={null}>
      <HostDemo pin={params.then((p) => p.pin)} />
    </Suspense>
  );
}

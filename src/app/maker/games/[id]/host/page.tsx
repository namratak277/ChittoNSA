import type { Metadata } from "next";
import { Suspense } from "react";
import { MakerHostSetup } from "@/screens/maker/MakerHostSetup";

export const metadata: Metadata = { title: "Host setup · Chhito!" };

// The id is read inside the Suspense boundary so the page shell can prerender.
export default function HostSetupPage({ params }: PageProps<"/maker/games/[id]/host">) {
  return (
    <Suspense fallback={null}>
      <MakerHostSetup gameId={params.then((p) => p.id)} />
    </Suspense>
  );
}

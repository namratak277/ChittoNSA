import type { Metadata } from "next";
import { Suspense } from "react";
import { MakerBuilder } from "@/screens/maker/MakerBuilder";

export const metadata: Metadata = { title: "Question builder · Chhito!" };

// The id is read inside the Suspense boundary so the page shell can prerender.
export default function BuilderPage({ params }: PageProps<"/maker/games/[id]">) {
  return (
    <Suspense fallback={null}>
      <MakerBuilder gameId={params.then((p) => p.id)} />
    </Suspense>
  );
}

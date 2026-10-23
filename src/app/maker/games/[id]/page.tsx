import type { Metadata } from "next";
import { MakerBuilder } from "@/screens/maker/MakerBuilder";

export const metadata: Metadata = { title: "Question builder · Chhito!" };

// Milestone 2: every game id shows the same fake game. Loading by id arrives in milestone 3.
export default function BuilderPage() {
  return <MakerBuilder title="Dashain & Democracy Night" />;
}

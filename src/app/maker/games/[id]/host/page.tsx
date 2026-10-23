import type { Metadata } from "next";
import { MakerHostSetup } from "@/screens/maker/MakerHostSetup";

export const metadata: Metadata = { title: "Host setup · Chhito!" };

// Milestone 2: every game id shows the same fake game. Loading by id arrives in milestone 3.
export default function HostSetupPage() {
  return <MakerHostSetup title="Dashain & Democracy Night" />;
}

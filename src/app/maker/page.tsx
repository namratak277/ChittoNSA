import type { Metadata } from "next";
import { MakerDashboard } from "@/screens/maker/MakerDashboard";

export const metadata: Metadata = { title: "My games · Chhito!" };

export default function MakerPage() {
  return <MakerDashboard />;
}

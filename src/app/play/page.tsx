import type { Metadata } from "next";
import { PlayerDemo } from "@/screens/player/PlayerDemo";

export const metadata: Metadata = { title: "Play · Chhito!" };

export default function PlayPage() {
  return <PlayerDemo />;
}

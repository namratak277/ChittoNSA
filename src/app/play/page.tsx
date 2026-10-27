import type { Metadata } from "next";
import { PlayerLive } from "@/screens/player/PlayerLive";

export const metadata: Metadata = { title: "Play · Chhito!" };

export default function PlayPage() {
  return <PlayerLive />;
}

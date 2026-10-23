import { ClimberMarker, type ClimberStyle } from "@/components/climbers/ClimberMarker";
import type { Team } from "@/lib/teams";

interface PlayerLobbyProps {
  nickname: string;
  team: Team;
  style: ClimberStyle;
}

/** Joined and waiting at Base Camp (second state of design-reference/C-Phone.dc.html). */
export function PlayerLobby({ nickname, team, style }: PlayerLobbyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
      <ClimberMarker style={style} team={team} size={140} />
      <h1 className="text-[38px] font-extrabold leading-[1.05]">Welcome to Base Camp!</h1>
      <p className="text-[22px] font-extrabold text-flag-red">
        {nickname}, you&apos;re on {team.name}
      </p>
      <p className="max-w-[280px] text-lg text-body">Your team climbs together. Up first: spend your 10 supply points.</p>
      <p className="mt-2 flex items-center gap-2 text-base font-bold text-body" role="status">
        <span className="size-2.5 animate-pulse rounded-full bg-flag-green" aria-hidden />
        Waiting for the host to start…
      </p>
    </div>
  );
}

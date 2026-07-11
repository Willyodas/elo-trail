import { useQuery } from "@tanstack/react-query";

import type { Aoe4WorldPlayer } from "@/services/aoe4world";
import type { ApiResponse } from "@/types/api";

async function fetchPlayerProfile(playerId: number): Promise<Aoe4WorldPlayer> {
  const response = await fetch(`/api/players/${playerId}`, {
    headers: {
      Accept: "application/json",
    },
  });

  const payload = (await response.json()) as ApiResponse<Aoe4WorldPlayer>;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? "The player profile could not be loaded.",
    );
  }

  if (!payload.data) {
    throw new Error("The player profile response did not include data.");
  }

  return payload.data;
}

export function usePlayerProfile(playerId: number | null | undefined) {
  const isValidPlayerId =
    typeof playerId === "number" && Number.isInteger(playerId) && playerId > 0;

  return useQuery({
    queryKey: ["player-profile", playerId],

    queryFn: () => fetchPlayerProfile(playerId as number),

    enabled: isValidPlayerId,

    staleTime: 5 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    retry: 1,
  });
}

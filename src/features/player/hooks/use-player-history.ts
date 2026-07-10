import { useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/types/api";
import type { EloHistory, HistoryLeaderboard } from "@/types/history";

export interface UsePlayerHistoryOptions {
  leaderboard?: HistoryLeaderboard;
  limit?: number;
  page?: number;
  enabled?: boolean;
}

const HISTORY_DATA_VERSION = "matchmaking-elo-v2";

function buildHistoryUrl(playerId: number, options: UsePlayerHistoryOptions) {
  const params = new URLSearchParams();

  /*
   * The application only supports underlying ranked
   * matchmaking ELO. Never request rm_solo ranked points.
   */
  params.set("leaderboard", "rm_1v1");

  params.set("limit", String(options.limit ?? 200));

  params.set("page", String(options.page ?? 1));

  /*
   * This invalidates browser and intermediary responses
   * created before ELO Trail switched from rating to MMR.
   */
  params.set("dataVersion", HISTORY_DATA_VERSION);

  return `/api/players/${playerId}/history?${params.toString()}`;
}

async function fetchPlayerHistory(
  playerId: number,
  options: UsePlayerHistoryOptions,
): Promise<EloHistory> {
  const response = await fetch(buildHistoryUrl(playerId, options), {
    cache: "no-store",

    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });

  const payload = (await response.json()) as ApiResponse<EloHistory>;

  if (!response.ok) {
    const message =
      payload.error?.message ?? "Matchmaking ELO history could not be loaded.";

    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error("The matchmaking ELO response did not include data.");
  }

  return payload.data;
}

export function usePlayerHistory(
  playerId: number | null | undefined,
  options: UsePlayerHistoryOptions = {},
) {
  const { enabled = true, limit = 200, page = 1 } = options;

  const hasValidPlayerId =
    typeof playerId === "number" && Number.isInteger(playerId) && playerId > 0;

  return useQuery({
    queryKey: [
      "player-history",
      HISTORY_DATA_VERSION,
      playerId,
      "rm_1v1",
      limit,
      page,
    ],

    queryFn: () =>
      fetchPlayerHistory(playerId as number, {
        leaderboard: "rm_1v1",
        limit,
        page,
      }),

    enabled: enabled && hasValidPlayerId,

    /*
     * Temporarily keep this at zero while validating the
     * migration from ranked points to matchmaking ELO.
     */
    staleTime: 0,

    gcTime: 5 * 60 * 1000,

    retry: 1,

    refetchOnMount: "always",

    refetchOnWindowFocus: true,
  });
}

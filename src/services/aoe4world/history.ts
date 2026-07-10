import type { PlayerGamesOptions } from "@/types/history";

import { aoe4Request } from "./client";
import type { Aoe4WorldGame, Aoe4WorldGamesResponse } from "./history-types";

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export async function getPlayerGames(
  playerId: number,
  options: PlayerGamesOptions = {},
): Promise<Aoe4WorldGame[]> {
  if (!Number.isInteger(playerId) || playerId <= 0) {
    throw new Error("A valid positive player profile ID is required");
  }

  const limit = Math.min(
    Math.max(Math.trunc(options.limit ?? DEFAULT_LIMIT), 1),
    MAX_LIMIT,
  );

  const page = Math.max(Math.trunc(options.page ?? 1), 1);

  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  if (options.leaderboard) {
    params.set("leaderboard", options.leaderboard);
  }

  const response = await aoe4Request<Aoe4WorldGamesResponse | Aoe4WorldGame[]>(
    `/players/${playerId}/games?${params.toString()}`,
  );

  return Array.isArray(response) ? response : (response.games ?? []);
}

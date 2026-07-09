import { aoe4Request } from "./client";

import type { Aoe4WorldPlayer, Aoe4WorldSearchResponse } from "./types";

export async function searchPlayers(query: string): Promise<Aoe4WorldPlayer[]> {
  if (!query.trim()) {
    return [];
  }

  const data = await aoe4Request<Aoe4WorldSearchResponse>(
    `/players/search?query=${encodeURIComponent(query)}`,
  );

  return data.results;
}

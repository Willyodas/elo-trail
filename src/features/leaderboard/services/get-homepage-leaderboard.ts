import type { HomepageLeaderboardData } from "@/features/leaderboard/types/homepage-leaderboard";
import { prisma } from "@/services/database/prisma";

import { HOMEPAGE_LEADERBOARD_KEY } from "./refresh-homepage-leaderboard";

export async function getHomepageLeaderboard(): Promise<HomepageLeaderboardData | null> {
  const record = await prisma.homepageLeaderboardSnapshot.findUnique({
    where: {
      key: HOMEPAGE_LEADERBOARD_KEY,
    },

    select: {
      data: true,
    },
  });

  if (!record) {
    return null;
  }

  return record.data as unknown as HomepageLeaderboardData;
}

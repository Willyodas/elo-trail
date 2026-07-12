import { NextResponse } from "next/server";

import { getHomepageLeaderboard } from "@/features/leaderboard/services/get-homepage-leaderboard";
import type { HomepageLeaderboardApiResponse } from "@/features/leaderboard/types/homepage-leaderboard";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getHomepageLeaderboard();

    if (!data) {
      return NextResponse.json<HomepageLeaderboardApiResponse>(
        {
          data: null,
          error: {
            code: "SNAPSHOT_NOT_READY",
            message:
              "The daily leaderboard snapshot has not been generated yet.",
          },
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        },
      );
    }

    return NextResponse.json<HomepageLeaderboardApiResponse>(
      {
        data,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",

          "X-Elo-Trail-Snapshot-Generated": data.generatedAt,
        },
      },
    );
  } catch (error) {
    console.error("Homepage leaderboard read failed", error);

    return NextResponse.json<HomepageLeaderboardApiResponse>(
      {
        data: null,
        error: {
          code: "SNAPSHOT_READ_FAILED",
          message: "The homepage leaderboard is temporarily unavailable.",
        },
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

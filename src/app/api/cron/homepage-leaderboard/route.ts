import { NextResponse } from "next/server";

import { refreshHomepageLeaderboard } from "@/features/leaderboard/services/refresh-homepage-leaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorised(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORISED",
          message: "Valid cron authorisation is required.",
        },
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const snapshot = await refreshHomepageLeaderboard();

    return NextResponse.json(
      {
        success: true,
        generatedAt: snapshot.generatedAt,
        players: snapshot.players.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Homepage leaderboard refresh failed", error);

    const details =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : undefined;

    return NextResponse.json(
      {
        error: {
          code: "LEADERBOARD_REFRESH_FAILED",
          message: "The homepage leaderboard snapshot could not be refreshed.",
          ...(details ? { details } : {}),
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

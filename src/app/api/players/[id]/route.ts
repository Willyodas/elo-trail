import { NextResponse } from "next/server";

import { aoe4Request } from "@/services/aoe4world/client";
import type { Aoe4WorldPlayer } from "@/services/aoe4world/types";
import type { ApiFailure, ApiSuccess } from "@/types/api";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function parsePlayerId(value: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const playerId = Number(value);

  return Number.isSafeInteger(playerId) && playerId > 0 ? playerId : null;
}

function failure(
  status: number,
  code: string,
  message: string,
): NextResponse<ApiFailure> {
  return NextResponse.json<ApiFailure>(
    {
      error: {
        code,
        message,
      },
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const playerId = parsePlayerId(id);

  if (playerId === null) {
    return failure(
      400,
      "INVALID_PLAYER_ID",
      "Player ID must be a positive integer.",
    );
  }

  try {
    const player = await aoe4Request<Aoe4WorldPlayer>(`/players/${playerId}`);

    return NextResponse.json<ApiSuccess<Aoe4WorldPlayer>>(
      {
        data: player,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load AoE4World player profile", {
      playerId,
      error,
    });

    return failure(
      502,
      "PLAYER_UPSTREAM_ERROR",
      "The player profile is temporarily unavailable.",
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { searchPlayers } from "@/services/aoe4world";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      {
        error: "Missing search query",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const players = await searchPlayers(query);

    return NextResponse.json({
      players,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}

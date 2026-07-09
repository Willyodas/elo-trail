import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "elo-trail",
    timestamp: new Date().toISOString(),
  });
}

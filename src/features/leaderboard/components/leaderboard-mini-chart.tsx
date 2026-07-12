"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

import type { EloPoint } from "@/types/history";

interface LeaderboardMiniChartProps {
  points: EloPoint[];
  name: string;
}

export function LeaderboardMiniChart({
  points,
  name,
}: LeaderboardMiniChartProps) {
  if (points.length < 2) {
    return (
      <div className="flex h-20 items-center justify-center text-xs text-black/40 dark:text-white/40">
        Insufficient 90-day history
      </div>
    );
  }

  const ratings = points.map((point) => point.rating);

  const minimum = Math.min(...ratings);

  const maximum = Math.max(...ratings);

  const padding = Math.max(10, Math.round((maximum - minimum) * 0.1));

  return (
    <div
      className="h-20 w-full"
      role="img"
      aria-label={`${name} matchmaking ELO over the last 90 days`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <YAxis hide domain={[minimum - padding, maximum + padding]} />

          <Line
            type="monotone"
            dataKey="rating"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

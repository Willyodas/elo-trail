"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EloPoint } from "@/types/history";

interface ComparisonPlayerSeries {
  profileId: number;
  name: string;
  points: EloPoint[];
}

interface EloComparisonChartProps {
  players: [ComparisonPlayerSeries, ComparisonPlayerSeries];
}

interface ComparisonChartRow {
  timestamp: string;
  [profileKey: string]: string | number | null;
}

function getSeriesKey(profileId: number) {
  return `player_${profileId}`;
}

function buildChartData(
  players: [ComparisonPlayerSeries, ComparisonPlayerSeries],
): ComparisonChartRow[] {
  const rows = new Map<string, ComparisonChartRow>();

  for (const player of players) {
    const seriesKey = getSeriesKey(player.profileId);

    for (const point of player.points) {
      const existing = rows.get(point.timestamp) ?? {
        timestamp: point.timestamp,
      };

      existing[seriesKey] = point.rating;

      rows.set(point.timestamp, existing);
    }
  }

  return [...rows.values()].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  );
}

export function EloComparisonChart({ players }: EloComparisonChartProps) {
  const data = buildChartData(players);

  const ratings = data.flatMap((row) =>
    players
      .map((player) => row[getSeriesKey(player.profileId)])
      .filter((value): value is number => typeof value === "number"),
  );

  if (ratings.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-xl border border-dashed border-black/15 dark:border-white/15">
        <p className="text-sm text-black/55 dark:text-white/55">
          No overlapping ELO history is available.
        </p>
      </div>
    );
  }

  const minimum = Math.min(...ratings);

  const maximum = Math.max(...ratings);

  const padding = Math.max(25, Math.round((maximum - minimum) * 0.12));

  return (
    <div className="h-[30rem] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 10,
            left: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            opacity={0.18}
          />

          <XAxis
            dataKey="timestamp"
            tickFormatter={(value: string) => format(new Date(value), "d MMM")}
            minTickGap={36}
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />

          <YAxis
            domain={[minimum - padding, maximum + padding]}
            width={58}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value: number) => value.toLocaleString()}
          />

          <Tooltip
            labelFormatter={(value) =>
              format(new Date(String(value)), "d MMM yyyy, h:mm a")
            }
            formatter={(value, name) => [
              `${Number(value).toLocaleString()} ELO`,
              String(name),
            ]}
          />

          <Legend />

          <Line
            type="monotone"
            dataKey={getSeriesKey(players[0].profileId)}
            name={players[0].name}
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
            }}
            connectNulls
          />

          <Line
            type="monotone"
            dataKey={getSeriesKey(players[1].profileId)}
            name={players[1].name}
            stroke="#dc2626"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
            }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

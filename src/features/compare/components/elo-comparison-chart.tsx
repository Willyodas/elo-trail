"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
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

  const firstPlayerHasData = players[0].points.length > 0;

  const secondPlayerHasData = players[1].points.length > 0;

  const ratings = data.flatMap((row) =>
    players
      .map((player) => row[getSeriesKey(player.profileId)])
      .filter((value): value is number => typeof value === "number"),
  );

  if (ratings.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/15">
        <div>
          <p className="font-medium">No comparison history available</p>

          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            Neither player has matchmaking ELO data in the selected period.
          </p>
        </div>
      </div>
    );
  }

  const minimum = Math.min(...ratings);
  const maximum = Math.max(...ratings);

  const padding = Math.max(25, Math.round((maximum - minimum) * 0.12));

  return (
    <div className="max-w-full min-w-0">
      {(!firstPlayerHasData || !secondPlayerHasData) && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm text-amber-800 dark:text-amber-300"
        >
          {!firstPlayerHasData
            ? `${players[0].name} has no ELO history in this period.`
            : `${players[1].name} has no ELO history in this period.`}
        </div>
      )}

      <div
        className="mb-3 grid min-w-0 gap-2 text-sm sm:grid-cols-2"
        aria-label="Chart series"
      >
        <div className="flex min-w-0 items-start gap-2">
          <span
            className="mt-2 h-0.5 w-5 shrink-0 bg-blue-600"
            aria-hidden="true"
          />
          <span className="min-w-0 break-words">{players[0].name}</span>
        </div>

        <div className="flex min-w-0 items-start gap-2 sm:justify-end">
          <span
            className="mt-2 h-0.5 w-5 shrink-0 bg-red-600"
            aria-hidden="true"
          />
          <span className="min-w-0 break-words sm:text-right">
            {players[1].name}
          </span>
        </div>
      </div>

      <div className="h-[20rem] max-w-full min-w-0 overflow-hidden sm:h-[30rem]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 12,
              bottom: 10,
              left: -8,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.18}
            />

            <XAxis
              dataKey="timestamp"
              tickFormatter={(value: string) =>
                format(new Date(value), "d MMM")
              }
              minTickGap={36}
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />

            <YAxis
              domain={[minimum - padding, maximum + padding]}
              width={58}
              tickLine={false}
              axisLine={false}
              fontSize={11}
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
    </div>
  );
}

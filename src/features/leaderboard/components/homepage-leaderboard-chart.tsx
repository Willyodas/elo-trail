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

import type { HomepageLeaderboardPlayer } from "../types/homepage-leaderboard";

interface HomepageLeaderboardChartProps {
  players: HomepageLeaderboardPlayer[];
}

interface ChartRow {
  timestamp: number;

  [seriesKey: string]: number | null;
}

const SERIES_COLOURS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#92400e",
  "#475569",
] as const;

function getSeriesKey(profileId: number) {
  return `player_${profileId}`;
}

function buildChartData(players: HomepageLeaderboardPlayer[]): ChartRow[] {
  const rows = new Map<number, ChartRow>();

  for (const player of players) {
    const seriesKey = getSeriesKey(player.profileId);

    for (const point of player.points) {
      const timestamp = new Date(point.timestamp).getTime();

      if (!Number.isFinite(timestamp)) {
        continue;
      }

      const existing = rows.get(timestamp) ?? {
        timestamp,
      };

      existing[seriesKey] = point.rating;

      rows.set(timestamp, existing);
    }
  }

  return [...rows.values()].sort(
    (left, right) => left.timestamp - right.timestamp,
  );
}

export function HomepageLeaderboardChart({
  players,
}: HomepageLeaderboardChartProps) {
  const orderedPlayers = [...players].sort(
    (left, right) => left.rank - right.rank,
  );

  const chartData = buildChartData(orderedPlayers);

  const ratings = orderedPlayers.flatMap((player) =>
    player.points.map((point) => point.rating),
  );

  if (chartData.length === 0 || ratings.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-black/15 p-6 text-center sm:min-h-96 sm:p-8 dark:border-white/15">
        <div>
          <p className="font-medium">Leaderboard history unavailable</p>

          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            The daily snapshot does not contain enough ELO history to draw the
            chart.
          </p>
        </div>
      </div>
    );
  }

  const minimumRating = Math.min(...ratings);

  const maximumRating = Math.max(...ratings);

  const ratingRange = maximumRating - minimumRating;

  const padding = Math.max(30, Math.round(ratingRange * 0.08));

  const chartDescription = orderedPlayers
    .map((player) => {
      const orderedPoints = [...player.points].sort(
        (left, right) =>
          new Date(left.timestamp).getTime() -
          new Date(right.timestamp).getTime(),
      );

      if (orderedPoints.length === 0) {
        return `Rank ${player.rank}, ${player.name}, has no matchmaking ELO history in the displayed period.`;
      }

      const firstPoint = orderedPoints[0]!;
      const lastPoint = orderedPoints[orderedPoints.length - 1]!;
      const change = lastPoint.rating - firstPoint.rating;
      const changeDescription =
        change === 0
          ? "no overall change"
          : `${Math.abs(change).toLocaleString()} ELO ${change > 0 ? "gain" : "loss"}`;

      return `Rank ${player.rank}, ${player.name}, starts at ${firstPoint.rating.toLocaleString()} ELO and ends at ${lastPoint.rating.toLocaleString()} ELO, a ${changeDescription}.`;
    })
    .join(" ");

  return (
    <>
      <p id="homepage-leaderboard-chart-description" className="sr-only">
        {chartDescription}
      </p>

      <div className="max-w-full min-w-0">
        <div
          className="h-[26rem] min-w-0 sm:h-[34rem]"
          role="img"
          aria-label="Ninety-day matchmaking ELO histories for the top ten players"
          aria-describedby="homepage-leaderboard-chart-description"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 16,
                right: 4,
                bottom: 12,
                left: -12,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.18}
              />

              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value: number) =>
                  format(new Date(value), "d MMM")
                }
                minTickGap={38}
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <YAxis
                domain={[minimumRating - padding, maximumRating + padding]}
                width={58}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(value: number) => value.toLocaleString()}
              />

              <Tooltip
                labelFormatter={(value) =>
                  format(new Date(Number(value)), "d MMM yyyy, h:mm a")
                }
                formatter={(value, name) => [
                  `${Number(value).toLocaleString()} ELO`,
                  String(name),
                ]}
              />

              {orderedPlayers.map((player, index) => (
                <Line
                  key={player.profileId}
                  type="monotone"
                  dataKey={getSeriesKey(player.profileId)}
                  name={`#${player.rank} ${player.name}`}
                  stroke={SERIES_COLOURS[index % SERIES_COLOURS.length]}
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ul
          className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          aria-label="Leaderboard chart series"
        >
          {orderedPlayers.map((player, index) => (
            <li
              key={player.profileId}
              className="flex min-w-0 items-center gap-2"
            >
              <span
                className="h-0.5 w-6 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    SERIES_COLOURS[index % SERIES_COLOURS.length],
                }}
                aria-hidden="true"
              />

              <span className="min-w-0 break-words">
                <span className="font-medium">#{player.rank}</span>{" "}
                {player.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

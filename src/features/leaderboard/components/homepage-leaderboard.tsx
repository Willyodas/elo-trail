"use client";

import { useQuery } from "@tanstack/react-query";
import { Crown, LoaderCircle } from "lucide-react";

import type {
  HomepageLeaderboardApiResponse,
  HomepageLeaderboardData,
} from "@/features/leaderboard/types/homepage-leaderboard";

import { LeaderboardMiniChart } from "./leaderboard-mini-chart";

async function fetchHomepageLeaderboard(): Promise<HomepageLeaderboardData> {
  const response = await fetch("/api/homepage-leaderboard", {
    headers: {
      Accept: "application/json",
    },
  });

  const payload = (await response.json()) as HomepageLeaderboardApiResponse;

  if (!response.ok || !payload.data) {
    throw new Error(
      payload.error?.message ?? "The leaderboard could not be loaded.",
    );
  }

  return payload.data;
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function HomepageLeaderboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["homepage-leaderboard"],

    queryFn: fetchHomepageLeaderboard,

    staleTime: 60 * 60 * 1000,

    gcTime: 24 * 60 * 60 * 1000,

    retry: 1,

    refetchOnWindowFocus: false,

    refetchInterval: false,
  });

  if (isLoading) {
    return (
      <section
        role="status"
        className="flex min-h-64 items-center justify-center rounded-2xl border border-black/10 dark:border-white/10"
      >
        <div className="flex items-center gap-3 text-black/55 dark:text-white/55">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Loading daily leaderboard…
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-2xl border border-dashed border-black/15 p-8 text-center dark:border-white/15">
        <h2 className="font-semibold">Daily leaderboard unavailable</h2>

        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          The last daily snapshot could not be loaded. Player search remains
          available below.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="top-players-heading" className="space-y-5">
      <header className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="size-5" aria-hidden="true" />

            <h2
              id="top-players-heading"
              className="text-2xl font-bold tracking-tight"
            >
              Top matchmaking ELO players
            </h2>
          </div>

          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            Current top eight RM 1v1 players with 90-day ELO timelines.
          </p>
        </div>

        <p className="text-xs text-black/45 dark:text-white/45">
          Updated {formatUpdatedAt(data.generatedAt)}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {data.players.map((player) => (
          <article
            key={player.profileId}
            className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black/45 dark:text-white/45">
                  Rank #{player.rank}
                </p>

                <h3 className="mt-1 truncate text-lg font-semibold">
                  {player.name}
                </h3>

                <p className="text-xs text-black/50 dark:text-white/50">
                  Profile #{player.profileId}
                  {player.country ? ` · ${player.country.toUpperCase()}` : ""}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold tabular-nums">
                  {player.currentElo.toLocaleString()}
                </p>

                <p className="text-xs text-black/45 dark:text-white/45">
                  Current ELO
                </p>
              </div>
            </div>

            <div className="mt-4 text-black dark:text-white">
              <LeaderboardMiniChart points={player.points} name={player.name} />
            </div>

            <p className="mt-2 text-xs text-black/45 dark:text-white/45">
              {player.gamesInWindow.toLocaleString()} games in the 90-day
              snapshot
            </p>
          </article>
        ))}
      </div>

      <p className="text-xs text-black/40 dark:text-white/40">
        Data source: AoE4World. ELO Trail is not affiliated with AoE4World,
        Microsoft, or World&apos;s Edge.
      </p>
    </section>
  );
}

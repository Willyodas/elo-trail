"use client";

import { useQuery } from "@tanstack/react-query";
import { Crown, LoaderCircle } from "lucide-react";

import type {
  HomepageLeaderboardApiResponse,
  HomepageLeaderboardData,
  HomepageLeaderboardPlayer,
} from "../types/homepage-leaderboard";

import { HomepageLeaderboardChart } from "./homepage-leaderboard-chart";

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

interface HomepageLeaderboardProps {
  selectedProfileId: number | null;
  onSelectPlayer: (player: HomepageLeaderboardPlayer) => void;
}

export function HomepageLeaderboard({
  selectedProfileId,
  onSelectPlayer,
}: HomepageLeaderboardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["homepage-leaderboard"],
    queryFn: fetchHomepageLeaderboard,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  if (isLoading) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="flex min-h-48 items-center justify-center rounded-2xl border border-black/10 p-6 dark:border-white/10"
      >
        <div className="flex items-center gap-3 text-sm text-black/55 dark:text-white/55">
          <LoaderCircle
            className="size-5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Loading daily leaderboard…
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-dashed border-black/15 p-6 text-center sm:p-8 dark:border-white/15"
      >
        <h2 className="font-semibold">Daily leaderboard unavailable</h2>

        <p className="mt-1 text-sm leading-6 text-black/55 dark:text-white/55">
          The latest daily snapshot could not be loaded. Player search remains
          available above.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="top-players-heading"
      className="min-w-0 space-y-5"
    >
      <header className="flex min-w-0 flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="flex min-w-0 items-start gap-2">
            <Crown className="mt-1 size-5 shrink-0" aria-hidden="true" />

            <h2
              id="top-players-heading"
              className="min-w-0 text-2xl font-bold tracking-tight"
            >
              Top matchmaking ELO players
            </h2>
          </div>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-black/55 dark:text-white/55">
            Ninety-day matchmaking ELO histories for the current top ten RM 1v1
            players.
          </p>
        </div>

        <p className="shrink-0 text-xs text-black/45 dark:text-white/45">
          Updated {formatUpdatedAt(data.generatedAt)}
        </p>
      </header>

      <div className="max-w-full min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-sm sm:p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <HomepageLeaderboardChart players={data.players} />
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {data.players.map((player) => (
          <button
            key={player.profileId}
            type="button"
            onClick={() => onSelectPlayer(player)}
            aria-pressed={selectedProfileId === player.profileId}
            aria-label={`View ${player.name} matchmaking ELO history`}
            className={[
              "flex min-h-24 w-full min-w-0 items-center justify-between gap-3 rounded-xl border bg-white p-3 text-left transition",
              "hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:outline-none",
              "dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:ring-white/40",
              selectedProfileId === player.profileId
                ? "border-black/40 ring-2 ring-black/10 dark:border-white/50 dark:ring-white/10"
                : "border-black/10 dark:border-white/10",
            ].join(" ")}
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-black/45 dark:text-white/45">
                Rank #{player.rank}
              </p>

              <h3 className="font-semibold break-words">{player.name}</h3>

              <p className="mt-1 text-xs leading-5 text-black/45 dark:text-white/45">
                {player.gamesInWindow.toLocaleString()} games in 90 days
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-lg font-bold tabular-nums sm:text-xl">
                {player.currentElo.toLocaleString()}
              </p>

              <p className="text-xs text-black/45 dark:text-white/45">ELO</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs leading-5 text-black/40 dark:text-white/40">
        Data source: AoE4World. ELO Trail is not affiliated with AoE4World,
        Microsoft, or World&apos;s Edge.
      </p>
    </section>
  );
}

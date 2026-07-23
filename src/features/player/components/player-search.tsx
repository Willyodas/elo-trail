"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import type { Aoe4WorldPlayer } from "@/services/aoe4world";

import { usePlayerSearch } from "../hooks/use-player-search";

import { PlayerCard } from "./player-card";

interface PlayerSearchProps {
  selectedPlayer: Aoe4WorldPlayer | null;
  onSelectPlayer: (player: Aoe4WorldPlayer | null) => void;
}

export function PlayerSearch({
  selectedPlayer,
  onSelectPlayer,
}: PlayerSearchProps) {
  const [query, setQuery] = useState("");
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const trimmedQuery = query.trim();

  const { data, isLoading, isFetching, error } = usePlayerSearch(query);

  const isSearching =
    isResultsOpen && trimmedQuery.length >= 3 && (isLoading || isFetching);

  function handleSelectPlayer(player: Aoe4WorldPlayer) {
    onSelectPlayer(player);
    setQuery(player.name);
    setIsResultsOpen(false);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setIsResultsOpen(true);

    /*
     * Once the user edits the query, the previous player panel
     * is no longer the active search context.
     */
    onSelectPlayer(null);
  }

  function handleSearchFocus() {
    if (trimmedQuery.length >= 3) {
      setIsResultsOpen(true);
    }
  }

  function handleClearSearch() {
    setQuery("");
    setIsResultsOpen(false);
    onSelectPlayer(null);
  }

  return (
    <section aria-labelledby="player-search-heading" className="min-w-0">
      <div className="mb-4">
        <h2
          id="player-search-heading"
          className="text-2xl font-bold tracking-tight"
        >
          Find a player
        </h2>

        <p className="mt-1 text-sm leading-6 text-black/55 dark:text-white/55">
          Search by player name to explore matchmaking ELO history and
          performance analytics.
        </p>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-black/40 dark:text-white/40"
          aria-hidden="true"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={handleSearchFocus}
          placeholder="Search Age of Empires IV players"
          aria-label="Search players"
          aria-describedby="player-search-help"
          aria-controls="player-search-results"
          autoComplete="off"
          maxLength={50}
          className="min-h-12 w-full rounded-xl border border-black/10 bg-white py-3 pr-12 pl-12 shadow-sm transition outline-none placeholder:text-black/35 focus:border-black/35 focus:ring-4 focus:ring-black/5 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-white/35 dark:focus:border-white/35 dark:focus:ring-white/5"
        />

        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear player search"
            className="absolute top-1/2 right-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-black/45 transition hover:bg-black/5 hover:text-black focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:outline-none dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-white/40"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <p
        id="player-search-help"
        className="mt-2 text-xs text-black/45 dark:text-white/45"
      >
        Enter at least three characters.
      </p>

      <div id="player-search-results" className="mt-6" aria-live="polite">
        {isSearching && (
          <div
            role="status"
            className="rounded-xl border border-black/10 bg-black/[0.015] p-4 text-sm text-black/55 dark:border-white/10 dark:bg-white/[0.025] dark:text-white/55"
          >
            Searching players…
          </div>
        )}

        {isResultsOpen && error && !isSearching && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-400"
          >
            Unable to search players. Please try again.
          </p>
        )}

        {isResultsOpen && !isSearching && !error && data && data.length > 0 && (
          <div>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">Search results</h3>

              <p className="text-sm text-black/55 dark:text-white/55">
                {data.length} {data.length === 1 ? "player" : "players"}
              </p>
            </div>

            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              {data.map((player) => (
                <PlayerCard
                  key={player.profile_id}
                  player={player}
                  isSelected={selectedPlayer?.profile_id === player.profile_id}
                  onSelect={handleSelectPlayer}
                />
              ))}
            </div>
          </div>
        )}

        {isResultsOpen &&
          !isSearching &&
          !error &&
          data &&
          data.length === 0 &&
          trimmedQuery.length >= 3 && (
            <div className="rounded-xl border border-dashed border-black/15 p-6 text-center sm:p-8 dark:border-white/15">
              <p className="font-medium">No players found</p>

              <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                Check the spelling or try another player name.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

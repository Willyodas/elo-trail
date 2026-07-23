import Link from "next/link";

import { HomepagePlayerWorkspace } from "@/features/player/components/homepage-player-workspace";

export default function DashboardPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8 sm:space-y-10">
        <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl min-w-0">
            <p className="text-sm font-semibold tracking-[0.2em] text-black/45 uppercase dark:text-white/45">
              Age of Empires IV
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              ELO Trail
            </h1>

            <p className="mt-4 text-base leading-7 text-black/60 sm:text-lg sm:leading-8 dark:text-white/60">
              Search for a player and explore their ranked matchmaking ELO
              progression, performance statistics, and recent results.
            </p>
          </div>

          <Link
            href="/compare"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:outline-none sm:w-fit dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:focus-visible:ring-white/40"
          >
            Compare two players
          </Link>
        </header>

        <HomepagePlayerWorkspace />
      </div>
    </main>
  );
}

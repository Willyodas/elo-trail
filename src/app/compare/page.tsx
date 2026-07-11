import Link from "next/link";

import { CompareWorkspace } from "@/features/compare";

export default function ComparePage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-black/45 uppercase dark:text-white/45">
              ELO Trail
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
              Compare players
            </h1>

            <p className="mt-4 text-lg leading-8 text-black/60 dark:text-white/60">
              Compare two Age of Empires IV players using their underlying
              ranked matchmaking ELO histories.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            Back to player search
          </Link>
        </header>

        <CompareWorkspace />
      </div>
    </main>
  );
}

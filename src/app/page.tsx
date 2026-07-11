import { PlayerSearch } from "@/features/player";
import Link from "next/link";

<Link
  href="/compare"
  className="inline-flex rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
>
  Compare players
</Link>;

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-black/45 uppercase dark:text-white/45">
            Age of Empires IV
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
            ELO Trail
          </h1>

          <p className="mt-4 text-lg leading-8 text-black/60 dark:text-white/60">
            Search for a player and explore their ranked rating progression,
            performance statistics, and recent results.
          </p>
        </header>

        <PlayerSearch />
      </div>
    </main>
  );
}

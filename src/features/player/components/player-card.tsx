import { ChevronRight } from "lucide-react";

import type { Aoe4WorldPlayer } from "@/services/aoe4world";

interface PlayerCardProps {
  player: Aoe4WorldPlayer;
  isSelected?: boolean;
  onSelect: (player: Aoe4WorldPlayer) => void;
}

export function PlayerCard({
  player,
  isSelected = false,
  onSelect,
}: PlayerCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(player)}
      aria-pressed={isSelected}
      aria-label={`View ${player.name} matchmaking ELO history`}
      className={[
        "min-h-28 w-full min-w-0 rounded-xl border p-4 text-left transition",
        "focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:outline-none",
        "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md",
        "dark:focus-visible:ring-white/40",
        isSelected
          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
          : "border-black/10 bg-white hover:bg-black/[0.02] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold break-words sm:text-lg">
            {player.name}
          </h3>

          <p
            className={[
              "mt-1 text-xs sm:text-sm",
              isSelected
                ? "text-white/65 dark:text-black/65"
                : "text-black/55 dark:text-white/55",
            ].join(" ")}
          >
            Profile #{player.profile_id}
          </p>

          <p
            className={[
              "mt-3 text-sm",
              isSelected
                ? "text-white/75 dark:text-black/75"
                : "text-black/60 dark:text-white/60",
            ].join(" ")}
          >
            View matchmaking ELO history
          </p>
        </div>

        <ChevronRight
          className="size-5 shrink-0 opacity-60"
          aria-hidden="true"
        />
      </div>
    </button>
  );
}

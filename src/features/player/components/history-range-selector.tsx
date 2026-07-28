export type HistoryRange = "30d" | "90d" | "180d";

interface HistoryRangeSelectorProps {
  value: HistoryRange;
  onChange: (range: HistoryRange) => void;
}

const OPTIONS: Array<{
  value: HistoryRange;
  label: string;
}> = [
  {
    value: "30d",
    label: "30 days",
  },
  {
    value: "90d",
    label: "90 days",
  },
  {
    value: "180d",
    label: "180 days",
  },
];

export function HistoryRangeSelector({
  value,
  onChange,
}: HistoryRangeSelectorProps) {
  return (
    <div
      className="grid w-full grid-cols-3 rounded-lg border border-black/10 bg-black/5 p-1 sm:inline-flex sm:w-auto dark:border-white/10 dark:bg-white/5"
      aria-label="ELO history date range"
    >
      {OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            className={[
              "min-h-10 rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-1 focus-visible:outline-none sm:px-3 dark:focus-visible:ring-white/50",
              isSelected
                ? "bg-white text-black shadow-sm dark:bg-white dark:text-black"
                : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

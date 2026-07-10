import type { EloStatistics, MatchSummary } from "@/types/history";

export function calculateEloStatistics(matches: MatchSummary[]): EloStatistics {
  const ratings = matches.map((match) => match.ratingAfter);

  const wins = matches.filter((match) => match.result === "win").length;

  const losses = matches.filter((match) => match.result === "loss").length;

  const decidedGames = wins + losses;

  return {
    currentRating: ratings.at(-1) ?? null,

    peakRating: ratings.length > 0 ? Math.max(...ratings) : null,

    lowestRating: ratings.length > 0 ? Math.min(...ratings) : null,

    ratingChange: matches.reduce(
      (total, match) => total + match.ratingChange,
      0,
    ),

    games: matches.length,

    wins,

    losses,

    winRate: decidedGames > 0 ? (wins / decidedGames) * 100 : null,
  };
}

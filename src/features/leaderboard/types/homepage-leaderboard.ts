import type { EloPoint } from "@/types/history";

export interface HomepageLeaderboardPlayer {
  rank: number;
  profileId: number;
  name: string;
  country?: string;
  currentElo: number;
  gamesInWindow: number;
  points: EloPoint[];
}

export interface HomepageLeaderboardData {
  key: string;
  generatedAt: string;
  source: string;
  historyDays: number;
  players: HomepageLeaderboardPlayer[];
}

export interface HomepageLeaderboardApiResponse {
  data: HomepageLeaderboardData | null;
  error?: {
    code: string;
    message: string;
  };
}

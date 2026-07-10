export interface Aoe4WorldGamePlayer {
  profile_id?: number | null;
  name?: string | null;
  civilization?: string | null;
  rating?: number | null;
  rating_diff?: number | null;
  result?: string | null;
}

export interface Aoe4WorldGame {
  game_id?: number | string;
  id?: number | string;
  started_at?: string | null;
  leaderboard?: string | null;
  map?: string | null;
  map_name?: string | null;
  teams?: Aoe4WorldGamePlayer[][] | null;
  players?: Aoe4WorldGamePlayer[] | null;
}

export interface Aoe4WorldGamesResponse {
  games?: Aoe4WorldGame[];
  total?: number;
  page?: number;
  per_page?: number;
}

export type Aoe4WorldPlayer = {
  profile_id: number;

  name: string;

  country?: string;

  steam_id?: string;

  avatar?: string;

  games?: number;

  win_rate?: number;

  rating?: number;
};

export type Aoe4WorldSearchResponse = {
  results: Aoe4WorldPlayer[];
};

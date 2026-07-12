import { gunzipSync } from "node:zlib";

import { parse } from "csv-parse/sync";

import {
  AOE4WORLD_REQUEST_TIMEOUT_MS,
  AOE4WORLD_USER_AGENT,
} from "@/lib/constants";

const AOE4WORLD_DUMPS_PAGE = "https://aoe4world.com/dumps";

const TOP_PLAYER_COUNT = 8;

interface CsvRecord {
  [key: string]: string | undefined;
}

export interface RmOneVOneEloLeaderboardPlayer {
  rank: number;
  profileId: number;
  name: string;
  country?: string;
  rating: number;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"');
}

function readField(record: CsvRecord, names: string[]): string | undefined {
  for (const name of names) {
    const value = record[name];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function parsePositiveInteger(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseFiniteNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, AOE4WORLD_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: "text/html,application/gzip,text/csv,*/*",
        "User-Agent": AOE4WORLD_USER_AGENT,
      },

      signal: controller.signal,

      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveRmOneVOneDumpUrl(): Promise<string> {
  const response = await fetchWithTimeout(AOE4WORLD_DUMPS_PAGE);

  if (!response.ok) {
    throw new Error(`Unable to load AoE4World dumps page: ${response.status}`);
  }

  const html = await response.text();

  const match = html.match(
    /<a[^>]+href="([^"]+)"[^>]*>\s*Leaderboard\s*-\s*RM\s*1v1\s*-\s*Elo\b/i,
  );

  if (!match?.[1]) {
    throw new Error("The RM 1v1 Elo dump link could not be found.");
  }

  return decodeHtmlEntities(match[1]);
}

function normaliseRecord(
  record: CsvRecord,
): RmOneVOneEloLeaderboardPlayer | null {
  const profileId = parsePositiveInteger(
    readField(record, ["profile_id", "profileId", "id"]),
  );

  const rank = parsePositiveInteger(readField(record, ["rank", "elo_rank"]));

  const rating = parseFiniteNumber(readField(record, ["rating", "elo", "mmr"]));

  const name = readField(record, ["name", "player_name"]);

  const country = readField(record, ["country", "country_code"]);

  if (profileId === null || rank === null || rating === null || !name) {
    return null;
  }

  return {
    profileId,
    rank,
    rating: Math.round(rating),
    name,
    country: country?.toLowerCase(),
  };
}

export async function getTopRmOneVOneEloPlayers(): Promise<
  RmOneVOneEloLeaderboardPlayer[]
> {
  const dumpUrl = await resolveRmOneVOneDumpUrl();

  const response = await fetchWithTimeout(dumpUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to download the RM 1v1 Elo dump: ${response.status}`,
    );
  }

  const compressed = Buffer.from(await response.arrayBuffer());

  const csv = gunzipSync(compressed).toString("utf8");

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
    trim: true,
  }) as CsvRecord[];

  const players = records
    .map(normaliseRecord)
    .filter(
      (player): player is RmOneVOneEloLeaderboardPlayer => player !== null,
    )
    .sort((left, right) => left.rank - right.rank);

  const uniquePlayers = new Map<number, RmOneVOneEloLeaderboardPlayer>();

  for (const player of players) {
    if (!uniquePlayers.has(player.profileId)) {
      uniquePlayers.set(player.profileId, player);
    }

    if (uniquePlayers.size >= TOP_PLAYER_COUNT) {
      break;
    }
  }

  const topPlayers = [...uniquePlayers.values()];

  if (topPlayers.length < TOP_PLAYER_COUNT) {
    throw new Error(
      `The RM 1v1 Elo dump returned only ${topPlayers.length} valid top players.`,
    );
  }

  return topPlayers;
}

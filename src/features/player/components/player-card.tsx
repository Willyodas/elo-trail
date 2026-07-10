import type { Aoe4WorldPlayer } from "@/services/aoe4world";

function getPrimaryLeaderboard(player: Aoe4WorldPlayer) {
  const leaderboards = player.leaderboards;

  if (!leaderboards) {
    return null;
  }

  const preferredKeys = ["rm_1v1", "qm_1v1"];

  for (const key of preferredKeys) {
    const leaderboard = leaderboards[key];

    if (typeof leaderboard?.rating === "number") {
      return {
        key,
        ...leaderboard,
      };
    }
  }

  const fallback = Object.entries(leaderboards).find(
    ([, leaderboard]) => typeof leaderboard.rating === "number",
  );

  if (!fallback) {
    return null;
  }

  const [key, leaderboard] = fallback;

  return {
    key,
    ...leaderboard,
  };
}

function formatLeaderboardName(key: string) {
  return key
    .replace("rm", "Ranked")
    .replace("qm", "Quick Match")
    .replaceAll("_", " ")
    .toUpperCase();
}

export function PlayerCard({ player }: { player: Aoe4WorldPlayer }) {
  const leaderboard = getPrimaryLeaderboard(player);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{player.name}</h3>

      <p className="text-muted-foreground text-sm">
        Profile ID: {player.profile_id}
      </p>

      {player.country && <p>Country: {player.country}</p>}

      {leaderboard && (
        <div className="mt-2">
          <p>
            Rating:{" "}
            <span className="font-medium">
              {leaderboard.rating?.toLocaleString()}
            </span>
          </p>

          <p className="text-muted-foreground text-sm">
            {formatLeaderboardName(leaderboard.key)}
            {typeof leaderboard.rank === "number"
              ? ` · Rank #${leaderboard.rank.toLocaleString()}`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}

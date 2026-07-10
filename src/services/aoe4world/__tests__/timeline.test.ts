import { describe, expect, it } from "vitest";

import type { Aoe4WorldGame } from "../history-types";
import { buildEloHistory } from "../timeline";

const PLAYER_ID = 100;
const OPPONENT_ID = 200;

function createGame(overrides: Partial<Aoe4WorldGame> = {}): Aoe4WorldGame {
  return {
    game_id: 1,
    started_at: "2026-07-01T10:00:00.000Z",
    kind: "rm_1v1",
    mmr_leaderboard: "rm_1v1_elo",
    map: "Dry Arabia",

    teams: [
      [
        {
          player: {
            profile_id: PLAYER_ID,
            name: "Willyodas",
            civilization: "english",
            result: "win",
            mmr: 1000,
            mmr_diff: 15,

            /*
             * These ranked-points fields intentionally
             * differ from MMR to verify they are ignored.
             */
            rating: 800,
            rating_diff: 5,
          },
        },
      ],

      [
        {
          player: {
            profile_id: OPPONENT_ID,
            name: "Opponent",
            civilization: "french",
            result: "loss",
            mmr: 995,
            mmr_diff: -15,
            rating: 850,
            rating_diff: -5,
          },
        },
      ],
    ],

    ...overrides,
  };
}

describe("buildEloHistory", () => {
  it("maps matchmaking MMR into ELO history", () => {
    const history = buildEloHistory(PLAYER_ID, [createGame()], "rm_1v1");

    expect(history.playerId).toBe(PLAYER_ID);

    expect(history.leaderboard).toBe("rm_1v1");

    expect(history.matches).toHaveLength(1);

    expect(history.points).toHaveLength(1);

    expect(history.matches[0]).toMatchObject({
      gameId: 1,
      result: "win",
      ratingBefore: 1000,
      ratingAfter: 1015,
      ratingChange: 15,
      opponentProfileId: OPPONENT_ID,
      opponentName: "Opponent",
      map: "Dry Arabia",
      civilization: "english",
    });
  });

  it("ignores seasonal ranked points when matchmaking MMR exists", () => {
    const history = buildEloHistory(PLAYER_ID, [
      createGame({
        teams: [
          [
            {
              player: {
                profile_id: PLAYER_ID,
                name: "Willyodas",
                result: "win",

                mmr: 929,
                mmr_diff: 9,

                rating: 848,
                rating_diff: 12,
              },
            },
          ],

          [
            {
              player: {
                profile_id: OPPONENT_ID,
                name: "Opponent",
                mmr: 920,
                mmr_diff: -9,
                rating: 900,
                rating_diff: -12,
              },
            },
          ],
        ],
      }),
    ]);

    expect(history.matches[0]).toMatchObject({
      ratingBefore: 929,
      ratingAfter: 938,
      ratingChange: 9,
    });

    expect(history.matches[0]?.ratingBefore).not.toBe(848);
  });

  it("sorts games chronologically", () => {
    const laterGame = createGame({
      game_id: 2,
      started_at: "2026-07-03T10:00:00.000Z",
    });

    const earlierGame = createGame({
      game_id: 1,
      started_at: "2026-07-01T10:00:00.000Z",
    });

    const history = buildEloHistory(PLAYER_ID, [laterGame, earlierGame]);

    expect(history.matches.map((match) => match.gameId)).toEqual([1, 2]);
  });

  it("uses MMR plus MMR difference as the resulting ELO", () => {
    const history = buildEloHistory(PLAYER_ID, [
      createGame({
        teams: [
          [
            {
              player: {
                profile_id: PLAYER_ID,
                name: "Willyodas",
                result: "loss",
                mmr: 1500,
                mmr_diff: -18,
                rating: 1200,
                rating_diff: -7,
              },
            },
          ],

          [
            {
              player: {
                profile_id: OPPONENT_ID,
                name: "Opponent",
                mmr: 1510,
                mmr_diff: 18,
              },
            },
          ],
        ],
      }),
    ]);

    expect(history.matches[0]).toMatchObject({
      ratingBefore: 1500,
      ratingAfter: 1482,
      ratingChange: -18,
    });

    expect(history.points[0]?.rating).toBe(1482);
  });

  it("normalises result values", () => {
    const wonGame = createGame({
      game_id: 1,
      teams: [
        [
          {
            player: {
              profile_id: PLAYER_ID,
              mmr: 1000,
              result: "WON",
            },
          },
        ],
      ],
    });

    const lostGame = createGame({
      game_id: 2,
      started_at: "2026-07-02T10:00:00.000Z",
      teams: [
        [
          {
            player: {
              profile_id: PLAYER_ID,
              mmr: 1000,
              result: "lost",
            },
          },
        ],
      ],
    });

    const unknownGame = createGame({
      game_id: 3,
      started_at: "2026-07-03T10:00:00.000Z",
      teams: [
        [
          {
            player: {
              profile_id: PLAYER_ID,
              mmr: 1000,
              result: null,
            },
          },
        ],
      ],
    });

    const history = buildEloHistory(PLAYER_ID, [
      wonGame,
      lostGame,
      unknownGame,
    ]);

    expect(history.matches.map((match) => match.result)).toEqual([
      "win",
      "loss",
      "unknown",
    ]);
  });

  it("ignores games without the requested player", () => {
    const game = createGame({
      teams: [
        [
          {
            player: {
              profile_id: 999,
              mmr: 1200,
            },
          },
        ],
      ],
    });

    const history = buildEloHistory(PLAYER_ID, [game]);

    expect(history.matches).toEqual([]);
    expect(history.points).toEqual([]);
    expect(history.statistics.games).toBe(0);
  });

  it("ignores games with invalid dates", () => {
    const history = buildEloHistory(PLAYER_ID, [
      createGame({
        started_at: "not-a-date",
      }),
    ]);

    expect(history.matches).toEqual([]);
  });

  it("ignores games without numeric matchmaking MMR", () => {
    const history = buildEloHistory(PLAYER_ID, [
      createGame({
        teams: [
          [
            {
              player: {
                profile_id: PLAYER_ID,
                mmr: null,

                /*
                 * A ranked-points value must not
                 * be used as an ELO fallback.
                 */
                rating: 848,
              },
            },
          ],
        ],
      }),
    ]);

    expect(history.matches).toEqual([]);
    expect(history.points).toEqual([]);
  });

  it("does not fall back to ranked points when MMR is missing", () => {
    const history = buildEloHistory(PLAYER_ID, [
      createGame({
        teams: [
          [
            {
              player: {
                profile_id: PLAYER_ID,
                rating: 848,
                rating_diff: 12,
              },
            },
          ],
        ],
      }),
    ]);

    expect(history.matches).toEqual([]);
    expect(history.statistics.currentRating).toBeNull();
  });

  it("throws for an invalid player ID", () => {
    expect(() => buildEloHistory(0, [])).toThrow(
      "A valid positive player profile ID is required",
    );
  });

  it("supports a flat players fallback", () => {
    const game: Aoe4WorldGame = {
      game_id: 5,
      started_at: "2026-07-05T10:00:00.000Z",

      players: [
        {
          profile_id: PLAYER_ID,
          name: "Willyodas",
          mmr: 1100,
          mmr_diff: 12,
          result: "win",
        },

        {
          profile_id: OPPONENT_ID,
          name: "Opponent",
          mmr: 1090,
          mmr_diff: -12,
        },
      ],
    };

    const history = buildEloHistory(PLAYER_ID, [game]);

    expect(history.matches[0]).toMatchObject({
      ratingAfter: 1112,
      opponentName: "Opponent",
    });
  });
});

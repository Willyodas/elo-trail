CREATE TABLE "HomepageLeaderboardSnapshot" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL,
  "source" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "HomepageLeaderboardSnapshot_pkey"
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX
  "HomepageLeaderboardSnapshot_key_key"
ON "HomepageLeaderboardSnapshot"("key");

CREATE INDEX
  "HomepageLeaderboardSnapshot_generatedAt_idx"
ON "HomepageLeaderboardSnapshot"("generatedAt");

import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/database", () => ({
  prisma: {
    operationalEvent: {
      deleteMany: vi.fn(),
    },
  },
}));

import {
  getOperationalEventRetentionCutoff,
  OPERATIONAL_EVENT_RETENTION_DAYS,
} from "../retention";

describe("operational event retention", () => {
  it("keeps a ninety-day reporting buffer", () => {
    expect(OPERATIONAL_EVENT_RETENTION_DAYS).toBe(90);
  });

  it("calculates the deletion cutoff in UTC", () => {
    const now = new Date("2026-08-02T12:00:00.000Z");

    expect(getOperationalEventRetentionCutoff(now).toISOString()).toBe(
      "2026-05-04T12:00:00.000Z",
    );
  });
});

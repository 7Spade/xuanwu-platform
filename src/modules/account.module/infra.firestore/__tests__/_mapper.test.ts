import { describe, expect, it } from "vitest";

import { accountDocToEntity, type AccountDoc } from "../_mapper";

describe("accountDocToEntity", () => {
  const baseDoc: AccountDoc = {
    id: "acc-1",
    handle: null,
    accountType: "personal",
    displayName: "Personal User",
    avatarUrl: null,
    bio: null,
    badgeSlugs: [],
    ownerId: null,
    members: null,
    teams: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  it("keeps valid organization accountType", () => {
    const entity = accountDocToEntity({ ...baseDoc, accountType: "organization" });
    expect(entity.accountType).toBe("organization");
  });

  it("falls back to personal when firestore accountType is invalid", () => {
    const entity = accountDocToEntity({
      ...baseDoc,
      accountType: "org" as unknown as AccountDoc["accountType"],
    });

    expect(entity.accountType).toBe("personal");
  });

  it("falls back to personal when firestore accountType is missing", () => {
    const entity = accountDocToEntity({
      ...baseDoc,
      accountType: undefined as unknown as AccountDoc["accountType"],
    });

    expect(entity.accountType).toBe("personal");
  });
});

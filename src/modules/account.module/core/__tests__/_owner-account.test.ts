import { describe, expect, it } from "vitest";

import { resolveOwnerAccountId } from "../_owner-account";
import type { AccountDTO } from "../_use-cases";

function makeAccount(id: string): AccountDTO {
  return {
    id,
    handle: null,
    accountType: "personal",
    displayName: "Personal Account",
    avatarUrl: null,
    bio: null,
    badgeSlugs: [],
    ownerId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("resolveOwnerAccountId", () => {
  it("prefers personal account id when account is available", () => {
    expect(resolveOwnerAccountId(makeAccount("acc_personal"), "firebase_uid")).toBe(
      "acc_personal",
    );
  });

  it("falls back to firebase uid when account is not hydrated", () => {
    expect(resolveOwnerAccountId(null, "firebase_uid")).toBe("firebase_uid");
  });

  it("returns null when both account and uid are missing", () => {
    expect(resolveOwnerAccountId(null, null)).toBeNull();
  });
});

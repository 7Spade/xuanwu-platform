import { describe, expect, it } from "vitest";

import type { AccountDTO } from "../_use-cases";
import { resolveOrganizationOwnerAccountId } from "../_owner-account";

function makeAccount(id: string): AccountDTO {
  return {
    id,
    handle: "owner",
    accountType: "personal",
    displayName: "Owner",
    avatarUrl: null,
    bio: null,
    badgeSlugs: [],
    ownerId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("resolveOrganizationOwnerAccountId", () => {
  it("prefers personal account id over firebase uid", () => {
    const account = makeAccount("acc-personal-1");
    expect(resolveOrganizationOwnerAccountId(account, "firebase-uid-1")).toBe(
      "acc-personal-1",
    );
  });

  it("falls back to firebase uid when account is not loaded", () => {
    expect(resolveOrganizationOwnerAccountId(null, "firebase-uid-1")).toBe(
      "firebase-uid-1",
    );
  });

  it("returns null when both account and uid are unavailable", () => {
    expect(resolveOrganizationOwnerAccountId(null, null)).toBeNull();
  });
});

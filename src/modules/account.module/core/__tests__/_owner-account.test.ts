import { describe, expect, it } from "vitest";

import { resolveOrganizationOwnerAccountId } from "../_owner-account";

describe("resolveOrganizationOwnerAccountId", () => {
  it("prefers personal account id over firebase uid", () => {
    expect(
      resolveOrganizationOwnerAccountId("acc-personal-1", "firebase-uid-1"),
    ).toBe(
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

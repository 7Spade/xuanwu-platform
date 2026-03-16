import { describe, expect, it } from "vitest";

import { resolveOrganizationOwnerId, resolvePersonalAccountLookupId } from "../_owner-account";

describe("resolveOrganizationOwnerId", () => {
  it("prefers personal account id when available", () => {
    expect(resolveOrganizationOwnerId("acc-personal-001", "firebase-uid-001")).toBe(
      "acc-personal-001",
    );
  });

  it("falls back to firebase uid when personal account id is missing", () => {
    expect(resolveOrganizationOwnerId(null, "firebase-uid-001")).toBe("firebase-uid-001");
    expect(resolveOrganizationOwnerId(undefined, "firebase-uid-001")).toBe("firebase-uid-001");
  });

  it("falls back to firebase uid when personal account id is blank", () => {
    expect(resolveOrganizationOwnerId("", "firebase-uid-001")).toBe("firebase-uid-001");
    expect(resolveOrganizationOwnerId("   ", "firebase-uid-001")).toBe("firebase-uid-001");
  });
});

describe("resolvePersonalAccountLookupId", () => {
  it("prefers accountId claim when available", () => {
    expect(resolvePersonalAccountLookupId("acc-personal-001", "firebase-uid-001")).toBe(
      "acc-personal-001",
    );
  });

  it("falls back to firebase uid when claim is missing", () => {
    expect(resolvePersonalAccountLookupId(null, "firebase-uid-001")).toBe("firebase-uid-001");
    expect(resolvePersonalAccountLookupId(undefined, "firebase-uid-001")).toBe(
      "firebase-uid-001",
    );
  });

  it("falls back to firebase uid when claim is not a string or blank", () => {
    expect(resolvePersonalAccountLookupId("", "firebase-uid-001")).toBe("firebase-uid-001");
    expect(resolvePersonalAccountLookupId("   ", "firebase-uid-001")).toBe("firebase-uid-001");
    expect(resolvePersonalAccountLookupId(123, "firebase-uid-001")).toBe("firebase-uid-001");
  });
});

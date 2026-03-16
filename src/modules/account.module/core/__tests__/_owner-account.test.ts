import { describe, expect, it } from "vitest";

import { resolveOrganizationOwnerId } from "../_owner-account";

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

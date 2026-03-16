import { describe, expect, it } from "vitest";

import { normalizeAccountType } from "../_value-objects";

describe("normalizeAccountType", () => {
  it("keeps explicit personal and organization values", () => {
    expect(normalizeAccountType("personal", null)).toBe("personal");
    expect(normalizeAccountType("organization", "acc-owner-001")).toBe("organization");
  });

  it("falls back to organization when ownerId exists", () => {
    expect(normalizeAccountType(undefined, "acc-owner-001")).toBe("organization");
    expect(normalizeAccountType("legacy", "acc-owner-001")).toBe("organization");
  });

  it("falls back to personal when ownerId is missing", () => {
    expect(normalizeAccountType(undefined, null)).toBe("personal");
    expect(normalizeAccountType(undefined, undefined)).toBe("personal");
    expect(normalizeAccountType("legacy", "")).toBe("personal");
    expect(normalizeAccountType("legacy", "   ")).toBe("personal");
  });
});

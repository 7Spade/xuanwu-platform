import { describe, it, expect } from "vitest";
import {
  isActiveSession,
  canUpgradeAnonymous,
  claimedAccountId,
  isTokenStale,
  isSessionExpired,
  findExpiredSessions,
} from "../_service";
import type { IdentityRecord } from "../_entity";

function makeIdentity(overrides: Partial<IdentityRecord> = {}): IdentityRecord {
  return {
    id: "uid-1",
    provider: "email",
    providerUid: "uid-1",
    accountId: null,
    email: "test@example.com",
    displayName: "Test User",
    isAnonymous: false,
    claims: null,
    createdAt: "2024-01-01T00:00:00Z",
    lastSignedInAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// isActiveSession
// ---------------------------------------------------------------------------

describe("isActiveSession", () => {
  it("returns true for a non-anonymous identity", () => {
    expect(isActiveSession(makeIdentity())).toBe(true);
  });

  it("returns false for an anonymous identity", () => {
    expect(isActiveSession(makeIdentity({ isAnonymous: true }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canUpgradeAnonymous
// ---------------------------------------------------------------------------

describe("canUpgradeAnonymous", () => {
  it("returns true for an anonymous identity", () => {
    expect(canUpgradeAnonymous(makeIdentity({ isAnonymous: true }))).toBe(true);
  });

  it("returns false for a non-anonymous identity", () => {
    expect(canUpgradeAnonymous(makeIdentity({ isAnonymous: false }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// claimedAccountId
// ---------------------------------------------------------------------------

describe("claimedAccountId", () => {
  it("returns accountId from claims", () => {
    const identity = makeIdentity({ claims: { accountId: "acc-42", accountType: "personal", role: "member", claimsVersion: 1 } });
    expect(claimedAccountId(identity)).toBe("acc-42");
  });

  it("returns null when claims are absent", () => {
    expect(claimedAccountId(makeIdentity())).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isTokenStale
// ---------------------------------------------------------------------------

describe("isTokenStale", () => {
  it("returns false when claimsVersion matches expected", () => {
    const identity = makeIdentity({ claims: { accountId: "acc-1", accountType: "personal", role: "member", claimsVersion: 3 } });
    expect(isTokenStale(identity, 3)).toBe(false);
  });

  it("returns true when claimsVersion is behind expected", () => {
    const identity = makeIdentity({ claims: { accountId: "acc-1", accountType: "personal", role: "member", claimsVersion: 1 } });
    expect(isTokenStale(identity, 3)).toBe(true);
  });

  it("returns true when claims are absent and expected version > 0", () => {
    expect(isTokenStale(makeIdentity(), 1)).toBe(true);
  });

  it("returns false when claims are absent and expected version is 0", () => {
    expect(isTokenStale(makeIdentity(), 0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isSessionExpired
// ---------------------------------------------------------------------------

describe("isSessionExpired", () => {
  it("returns true when session exceeds max duration", () => {
    const lastSignedIn = new Date("2024-01-01T00:00:00Z").getTime();
    const now = lastSignedIn + 8 * 24 * 60 * 60 * 1000; // 8 days later
    const maxDuration = 7 * 24 * 60 * 60 * 1000;        // 7-day limit
    const identity = makeIdentity({ lastSignedInAt: new Date(lastSignedIn).toISOString() });
    expect(isSessionExpired(identity, maxDuration, now)).toBe(true);
  });

  it("returns false when session is within max duration", () => {
    const lastSignedIn = new Date("2024-01-01T00:00:00Z").getTime();
    const now = lastSignedIn + 3 * 24 * 60 * 60 * 1000; // 3 days later
    const maxDuration = 7 * 24 * 60 * 60 * 1000;
    const identity = makeIdentity({ lastSignedInAt: new Date(lastSignedIn).toISOString() });
    expect(isSessionExpired(identity, maxDuration, now)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// findExpiredSessions
// ---------------------------------------------------------------------------

describe("findExpiredSessions", () => {
  it("returns only expired sessions", () => {
    const base = new Date("2024-01-01T00:00:00Z").getTime();
    const maxDuration = 7 * 24 * 60 * 60 * 1000;
    const now = base + 10 * 24 * 60 * 60 * 1000; // 10 days later
    const recent = makeIdentity({ id: "uid-recent", lastSignedInAt: new Date(base + 9 * 24 * 60 * 60 * 1000).toISOString() });
    const expired = makeIdentity({ id: "uid-expired", lastSignedInAt: new Date(base).toISOString() });
    const result = findExpiredSessions([recent, expired], maxDuration, now);
    expect(result.map((r) => r.id)).toContain("uid-expired");
    expect(result.map((r) => r.id)).not.toContain("uid-recent");
  });

  it("returns empty for no identities", () => {
    expect(findExpiredSessions([], 1000)).toHaveLength(0);
  });
});

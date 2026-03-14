import { describe, it, expect } from "vitest";
import {
  isOwner,
  getActiveMembership,
  getMemberRole,
  canInviteMember,
  canTransferOwnership,
  isAlreadyMember,
  getUserTeamIds,
  isValidHandle,
} from "../_service";
import type { AccountEntity, MembershipRecord } from "../_entity";
import type { AccountId } from "../_value-objects";

const OWNER_ID = "acc-owner" as AccountId;
const MEMBER_ID = "acc-member" as AccountId;
const STRANGER_ID = "acc-stranger" as AccountId;

function makeMembership(
  accountId: AccountId,
  role: MembershipRecord["role"] = "member",
  status: MembershipRecord["status"] = "active",
): MembershipRecord {
  return { id: `m-${accountId}`, accountId, role, status, invitedAt: "2024-01-01T00:00:00Z", acceptedAt: "2024-01-01T00:00:00Z" };
}

function makeOrgAccount(members: MembershipRecord[] = []): AccountEntity {
  return {
    id: OWNER_ID,
    handle: null,
    accountType: "organization",
    profile: { displayName: "Org", avatarUrl: null, bio: null, badgeSlugs: [] },
    ownerId: OWNER_ID,
    members,
    teams: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// isOwner
// ---------------------------------------------------------------------------

describe("isOwner", () => {
  it("returns true for the owner", () => {
    const account = makeOrgAccount();
    expect(isOwner(account, OWNER_ID)).toBe(true);
  });

  it("returns false for a non-owner", () => {
    const account = makeOrgAccount();
    expect(isOwner(account, MEMBER_ID)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getActiveMembership / getMemberRole
// ---------------------------------------------------------------------------

describe("getActiveMembership", () => {
  it("returns active membership for an active member", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID)]);
    expect(getActiveMembership(account, MEMBER_ID)).not.toBeNull();
  });

  it("returns null for a stranger", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID)]);
    expect(getActiveMembership(account, STRANGER_ID)).toBeNull();
  });

  it("ignores inactive membership", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID, "member", "suspended")]);
    expect(getActiveMembership(account, MEMBER_ID)).toBeNull();
  });
});

describe("getMemberRole", () => {
  it("returns the role of an active member", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID, "admin")]);
    expect(getMemberRole(account, MEMBER_ID)).toBe("admin");
  });

  it("returns null for non-member", () => {
    const account = makeOrgAccount();
    expect(getMemberRole(account, STRANGER_ID)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// canInviteMember
// ---------------------------------------------------------------------------

describe("canInviteMember", () => {
  it("owner can invite", () => {
    const account = makeOrgAccount();
    expect(canInviteMember(account, OWNER_ID)).toBe(true);
  });

  it("admin can invite", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID, "admin")]);
    expect(canInviteMember(account, MEMBER_ID)).toBe(true);
  });

  it("regular member cannot invite", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID, "member")]);
    expect(canInviteMember(account, MEMBER_ID)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canTransferOwnership
// ---------------------------------------------------------------------------

describe("canTransferOwnership", () => {
  it("returns true for an admin member", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID, "admin")]);
    expect(canTransferOwnership(account, MEMBER_ID)).toBe(true);
  });

  it("returns false for a regular member", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID, "member")]);
    expect(canTransferOwnership(account, MEMBER_ID)).toBe(false);
  });

  it("returns false for a non-member", () => {
    const account = makeOrgAccount();
    expect(canTransferOwnership(account, STRANGER_ID)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isAlreadyMember
// ---------------------------------------------------------------------------

describe("isAlreadyMember", () => {
  it("returns true for an active member", () => {
    const account = makeOrgAccount([makeMembership(MEMBER_ID)]);
    expect(isAlreadyMember(account, MEMBER_ID)).toBe(true);
  });

  it("returns false for a stranger", () => {
    const account = makeOrgAccount();
    expect(isAlreadyMember(account, STRANGER_ID)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getUserTeamIds
// ---------------------------------------------------------------------------

describe("getUserTeamIds", () => {
  it("returns team IDs for a member", () => {
    const account: AccountEntity = {
      ...makeOrgAccount([makeMembership(MEMBER_ID)]),
      teams: [
        { id: "team-1" as any, name: "T1", description: "", type: "internal", memberIds: [MEMBER_ID], createdAt: "2024-01-01T00:00:00Z" },
      ],
    };
    const ids = getUserTeamIds(account, MEMBER_ID);
    expect(ids.has("team-1")).toBe(true);
  });

  it("returns empty set for non-member", () => {
    const account = makeOrgAccount();
    expect(getUserTeamIds(account, STRANGER_ID).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// isValidHandle
// ---------------------------------------------------------------------------

describe("isValidHandle", () => {
  it("accepts valid handles (lowercase letters, digits, hyphens)", () => {
    expect(isValidHandle("alice")).toBe(true);
    expect(isValidHandle("alice-org")).toBe(true);
    expect(isValidHandle("alice123")).toBe(true);
  });

  it("rejects empty handle", () => {
    expect(isValidHandle("")).toBe(false);
  });

  it("rejects handle with spaces", () => {
    expect(isValidHandle("alice org")).toBe(false);
  });

  it("rejects handle with uppercase letters", () => {
    expect(isValidHandle("Alice")).toBe(false);
  });

  it("rejects handle shorter than 3 characters", () => {
    expect(isValidHandle("ab")).toBe(false);
  });
});

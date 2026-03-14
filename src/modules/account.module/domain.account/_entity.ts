import type { AccountId, AccountType, AccountHandle, MemberRole, MembershipStatus, TeamId } from "./_value-objects";

// ---------------------------------------------------------------------------
// AccountProfile
// ---------------------------------------------------------------------------

/** Public-facing profile attached to every account. */
export interface AccountProfile {
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly bio: string | null;
  /** Slugs of achievement badges unlocked for this account. */
  readonly badgeSlugs: readonly string[];
}

// ---------------------------------------------------------------------------
// MembershipRecord — sub-aggregate for org accounts
// ---------------------------------------------------------------------------

/** Membership of a personal account within an organization account. */
export interface MembershipRecord {
  readonly id: string;
  /** The personal AccountId that holds this membership. */
  readonly accountId: AccountId;
  readonly role: MemberRole;
  readonly status: MembershipStatus;
  readonly invitedAt: string;   // ISO-8601
  readonly acceptedAt: string | null; // ISO-8601
}

// ---------------------------------------------------------------------------
// TeamRecord — sub-aggregate for org accounts
// ---------------------------------------------------------------------------

/** A named group of members within an organization account. */
export interface TeamRecord {
  readonly id: TeamId;
  readonly name: string;
  readonly description: string;
  readonly type: "internal" | "external";
  /** Ordered list of member AccountIds belonging to this team. */
  readonly memberIds: readonly AccountId[];
  readonly createdAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// AccountEntity — aggregate root
// ---------------------------------------------------------------------------

/**
 * The Account aggregate root.
 *
 * Invariants:
 *   - An Account is associated with exactly one Identity (via accountId = IdentityId).
 *   - AccountHandle is globally unique across all account types.
 *   - Account.handle must be kept in sync with the namespace slug owned by this account.
 *   - An Org account has exactly one owner (a personal Account).
 *   - Team and Membership sub-aggregates exist only for AccountType: organization.
 */
export interface AccountEntity {
  readonly id: AccountId;
  readonly handle: AccountHandle | null; // null until namespace registration completes
  readonly accountType: AccountType;
  readonly profile: AccountProfile;
  /** Personal account: null. Org account: the owning personal AccountId. */
  readonly ownerId: AccountId | null;
  /** Org accounts only — null for personal accounts. */
  readonly members: readonly MembershipRecord[] | null;
  /** Org accounts only — null for personal accounts. */
  readonly teams: readonly TeamRecord[] | null;
  readonly createdAt: string;   // ISO-8601
  readonly updatedAt: string;   // ISO-8601
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Create a new personal AccountEntity. */
export function buildPersonalAccount(
  id: AccountId,
  displayName: string,
  now: string,
): AccountEntity {
  return {
    id,
    handle: null,
    accountType: "personal",
    profile: { displayName, avatarUrl: null, bio: null, badgeSlugs: [] },
    ownerId: null,
    members: null,
    teams: null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Create a new organization AccountEntity. */
export function buildOrganizationAccount(
  id: AccountId,
  ownerId: AccountId,
  displayName: string,
  now: string,
): AccountEntity {
  return {
    id,
    handle: null,
    accountType: "organization",
    profile: { displayName, avatarUrl: null, bio: null, badgeSlugs: [] },
    ownerId,
    members: [],
    teams: [],
    createdAt: now,
    updatedAt: now,
  };
}

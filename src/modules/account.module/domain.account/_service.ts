/**
 * Account domain services — pure business-rule functions spanning the Account aggregate.
 *
 * All functions are synchronous, side-effect free, and infrastructure-independent.
 * No async I/O or framework imports are permitted in this file.
 *
 * Derived from 7Spade/xuanwu src/features/account.slice/_account.rules.ts and
 * src/features/account.slice/domain.profile, adapted to the DDD 4-layer model.
 */

import type { AccountEntity, MembershipRecord, TeamRecord } from "./_entity";
import type { AccountId, MemberRole } from "./_value-objects";
import { AccountHandleSchema } from "./_value-objects";

// ---------------------------------------------------------------------------
// Ownership queries
// ---------------------------------------------------------------------------

/**
 * Returns true if the given userId is the owner of this account.
 * Only organisation accounts have a non-null ownerId.
 */
export function isOwner(account: AccountEntity, userId: AccountId): boolean {
  return account.ownerId === userId;
}

// ---------------------------------------------------------------------------
// Membership queries
// ---------------------------------------------------------------------------

/**
 * Returns the active MembershipRecord for `userId` within this org account,
 * or `null` if the user is not an active member.
 */
export function getActiveMembership(
  account: AccountEntity,
  userId: AccountId,
): MembershipRecord | null {
  return (account.members ?? []).find(
    (m) => m.accountId === userId && m.status === "active",
  ) ?? null;
}

/**
 * Returns the MemberRole of `userId` in this org account, or `null` when
 * the user is the owner (not listed in members) or not a member at all.
 *
 * Owner is treated as a superset of admin — callers should check `isOwner`
 * first when an "owner or admin" gate is required.
 */
export function getMemberRole(
  account: AccountEntity,
  userId: AccountId,
): MemberRole | null {
  const membership = getActiveMembership(account, userId);
  return membership?.role ?? null;
}

/**
 * Returns true if `actorId` has permission to invite new members.
 * Invariant: only the owner or an admin may invite members.
 */
export function canInviteMember(account: AccountEntity, actorId: AccountId): boolean {
  if (isOwner(account, actorId)) return true;
  const role = getMemberRole(account, actorId);
  return role === "admin";
}

/**
 * Returns true if `newOwnerId` is eligible to receive org ownership transfer.
 * Invariant: the new owner must hold an active membership with at least admin role.
 */
export function canTransferOwnership(
  account: AccountEntity,
  newOwnerId: AccountId,
): boolean {
  const membership = getActiveMembership(account, newOwnerId);
  if (!membership) return false;
  return membership.role === "admin";
}

/**
 * Returns true if `targetId` is already an active member of this org account.
 * Used before sending an invite to prevent duplicate membership.
 */
export function isAlreadyMember(account: AccountEntity, targetId: AccountId): boolean {
  return (account.members ?? []).some(
    (m) => m.accountId === targetId && m.status === "active",
  );
}

// ---------------------------------------------------------------------------
// Team queries
// ---------------------------------------------------------------------------

/**
 * Returns all TeamRecords inside the org that `userId` belongs to.
 */
export function getUserTeams(account: AccountEntity, userId: AccountId): TeamRecord[] {
  return (account.teams ?? []).filter((team) =>
    (team.memberIds ?? []).includes(userId),
  );
}

/**
 * Returns a Set of TeamIds that `userId` belongs to within this account.
 * Prefer this over `getUserTeams` for efficient membership checks.
 */
export function getUserTeamIds(account: AccountEntity, userId: AccountId): Set<string> {
  return new Set(getUserTeams(account, userId).map((t) => t.id));
}

// ---------------------------------------------------------------------------
// Handle validation
// ---------------------------------------------------------------------------

/**
 * Returns true when `handle` conforms to the AccountHandle invariant rules:
 *   - 3–39 characters
 *   - lowercase alphanumeric and hyphens only
 *
 * This is a pure validation helper; uniqueness enforcement is the responsibility
 * of IAccountHandleAvailabilityPort (namespace.module integration).
 */
export function isValidHandle(handle: string): boolean {
  return AccountHandleSchema.safeParse(handle).success;
}

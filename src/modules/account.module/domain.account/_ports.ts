import type { AccountEntity } from "./_entity";
import type { AccountId, AccountHandle, MemberRole } from "./_value-objects";

// ---------------------------------------------------------------------------
// IAccountRepository
// ---------------------------------------------------------------------------

/**
 * Port interface for persisting Account aggregates.
 * Implemented by the Firestore infrastructure adapter.
 */
export interface IAccountRepository {
  findById(id: AccountId): Promise<AccountEntity | null>;
  findByHandle(handle: AccountHandle): Promise<AccountEntity | null>;
  findOrganizationsByOwnerId(ownerId: AccountId): Promise<AccountEntity[]>;
  /**
   * Returns all organization accounts in which `memberId` holds an active
   * (non-owner) membership.  Does NOT include organizations the user owns —
   * use findOrganizationsByOwnerId for those.
   */
  findOrganizationsByMemberId(memberId: AccountId): Promise<AccountEntity[]>;
  save(account: AccountEntity): Promise<void>;
  deleteById(id: AccountId): Promise<void>;
}

// ---------------------------------------------------------------------------
// IAccountHandleAvailabilityPort
// ---------------------------------------------------------------------------

/**
 * Port for checking whether a handle is available before assignment.
 * Delegates to namespace.module's read model for global uniqueness enforcement.
 */
export interface IAccountHandleAvailabilityPort {
  isAvailable(handle: AccountHandle): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// IAccountBadgeWritePort
// ---------------------------------------------------------------------------

/**
 * Write port consumed by achievement.module to project badge unlocks onto accounts.
 * Ensures achievement.module does not import account.module directly.
 */
export interface IAccountBadgeWritePort {
  addBadge(accountId: AccountId, badgeSlug: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// IMembershipRepository
// ---------------------------------------------------------------------------

/**
 * Port interface for managing Membership records within an org account.
 */
export interface IMembershipRepository {
  findById(id: string): Promise<{ accountId: AccountId; role: MemberRole; status: string } | null>;
  invite(orgAccountId: AccountId, memberAccountId: AccountId, role: MemberRole, now: string): Promise<void>;
  accept(id: string, now: string): Promise<void>;
  updateRole(id: string, newRole: MemberRole): Promise<void>;
  revoke(id: string): Promise<void>;
}

import type { AccountId, MemberRole } from "./_value-objects";
import type { AccountProfile } from "./_entity";

// ---------------------------------------------------------------------------
// Base event shape
// ---------------------------------------------------------------------------

interface AccountDomainEvent {
  readonly accountId: AccountId;
  readonly occurredAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Emitted when a new personal account is provisioned (triggered by identity registration). */
export interface PersonalAccountCreated extends AccountDomainEvent {
  readonly type: "account:personal:created";
  readonly displayName: string;
  readonly email: string | null;
}

/** Emitted when an organization account is created. */
export interface OrganizationAccountCreated extends AccountDomainEvent {
  readonly type: "account:organization:created";
  readonly ownerId: AccountId;
  readonly displayName: string;
}

/** Emitted when any account profile field is updated. */
export interface AccountProfileUpdated extends AccountDomainEvent {
  readonly type: "account:profile:updated";
  readonly updatedFields: Partial<AccountProfile>;
}

/**
 * Emitted when an account handle (slug) is set or changed.
 * Downstream: namespace.module must keep the corresponding namespace in sync.
 */
export interface AccountHandleChanged extends AccountDomainEvent {
  readonly type: "account:handle:changed";
  readonly previousHandle: string | null;
  readonly newHandle: string;
}

/** Emitted when a member's invitation is accepted. */
export interface MemberJoined extends AccountDomainEvent {
  readonly type: "account:member:joined";
  readonly memberAccountId: AccountId;
  readonly role: MemberRole;
}

/** Emitted when a member's role is updated by an admin or owner. */
export interface MemberRoleChanged extends AccountDomainEvent {
  readonly type: "account:member:role:changed";
  readonly memberAccountId: AccountId;
  readonly previousRole: MemberRole;
  readonly newRole: MemberRole;
}

/** Emitted when a member is removed from the organization account. */
export interface MemberRemoved extends AccountDomainEvent {
  readonly type: "account:member:removed";
  readonly memberAccountId: AccountId;
}

/** Emitted when an achievement badge is projected onto this account. */
export interface AccountBadgeUnlocked extends AccountDomainEvent {
  readonly type: "account:badge:unlocked";
  readonly badgeSlug: string;
  readonly source: "achievement.module";
}

/** Union of all account domain events. */
export type AccountDomainEventUnion =
  | PersonalAccountCreated
  | OrganizationAccountCreated
  | AccountProfileUpdated
  | AccountHandleChanged
  | MemberJoined
  | MemberRoleChanged
  | MemberRemoved
  | AccountBadgeUnlocked;

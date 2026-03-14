import type { AuthClaims } from "./_value-objects";

// ---------------------------------------------------------------------------
// Base event shape
// ---------------------------------------------------------------------------

interface IdentityDomainEvent {
  readonly identityId: string;
  readonly occurredAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Emitted when a new user completes registration (first sign-in + account provisioned). */
export interface IdentityRegistered extends IdentityDomainEvent {
  readonly type: "identity:registered";
  readonly accountId: string;
  readonly email: string | null;
  readonly provider: string;
}

/** Emitted on every successful sign-in. */
export interface IdentitySignedIn extends IdentityDomainEvent {
  readonly type: "identity:signed-in";
  readonly provider: string;
}

/** Emitted when the user explicitly signs out. */
export interface IdentitySignedOut extends IdentityDomainEvent {
  readonly type: "identity:signed-out";
}

/**
 * Emitted when the JWT custom claims are updated (e.g. after a role change).
 * Receiving systems should force-refresh the auth token.
 */
export interface AuthClaimsUpdated extends IdentityDomainEvent {
  readonly type: "identity:claims:updated";
  readonly accountId: string;
  readonly claims: AuthClaims;
}

/** Emitted when an active session is explicitly revoked (admin action or sign-out). */
export interface SessionRevoked extends IdentityDomainEvent {
  readonly type: "identity:session:revoked";
  readonly reason: "sign-out" | "admin-revoke" | "security-block";
}

/** Union of all identity domain events. */
export type IdentityDomainEventUnion =
  | IdentityRegistered
  | IdentitySignedIn
  | IdentitySignedOut
  | AuthClaimsUpdated
  | SessionRevoked;

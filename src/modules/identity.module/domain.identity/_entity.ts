import type { IdentityId, IdentityProvider, AuthClaims, AuthUser } from "./_value-objects";

// ---------------------------------------------------------------------------
// IdentityRecord — aggregate root
// ---------------------------------------------------------------------------

/**
 * The Identity aggregate root.
 * Represents the authenticated credential record for a single subject.
 *
 * Invariants:
 *   - An Identity is uniquely keyed by its (provider, providerUid) pair.
 *   - An Identity belongs to exactly one Account (personal or organization).
 *   - An Identity cannot be transferred between Accounts.
 *   - isAnonymous identities may be upgraded to a permanent provider identity.
 */
export interface IdentityRecord {
  /** Primary key — equals the auth provider's UID for the primary credential. */
  readonly id: IdentityId;
  /** Authentication provider used to create this credential. */
  readonly provider: IdentityProvider;
  /** UID issued by the external provider (may differ from `id` for linked providers). */
  readonly providerUid: string;
  /** Linked account ID in account.module (set after account provisioning). */
  readonly accountId: string | null;
  readonly email: string | null;
  readonly displayName: string | null;
  /** True when the user signed in via the anonymous provider. */
  readonly isAnonymous: boolean;
  /** Custom JWT claims reflecting accountId, accountType, and role. */
  readonly claims: AuthClaims | null;
  readonly createdAt: string;       // ISO-8601
  readonly lastSignedInAt: string;  // ISO-8601
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Build an IdentityRecord from an AuthUser returned by the auth provider. */
export function buildIdentityRecord(
  user: AuthUser,
  provider: IdentityProvider,
  now: string,
): IdentityRecord {
  return {
    id: user.uid,
    provider,
    providerUid: user.uid,
    accountId: null,
    email: user.email,
    displayName: user.displayName,
    isAnonymous: provider === "anonymous",
    claims: null,
    createdAt: now,
    lastSignedInAt: now,
  };
}

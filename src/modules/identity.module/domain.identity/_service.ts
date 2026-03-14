/**
 * Identity domain services — pure, side-effect-free logic spanning identity aggregates.
 *
 * All functions are synchronous and infrastructure-independent unless explicitly marked
 * as async (only where pure domain computation requires a deferred step).
 *
 * Derived from 7Spade/xuanwu src/features/identity.slice/_claims-handler.ts and
 * identity domain rules, adapted to the DDD 4-layer model.
 */

import type { IdentityRecord } from "./_entity";
import type { IdentityId } from "./_value-objects";

// ---------------------------------------------------------------------------
// Session state queries
// ---------------------------------------------------------------------------

/**
 * Returns true when the IdentityRecord represents an active, non-anonymous session.
 * A session is considered valid when it has a uid and is not anonymous.
 */
export function isActiveSession(identity: IdentityRecord): boolean {
  return !identity.isAnonymous;
}

/**
 * Returns true when the identity can be upgraded from anonymous to a permanent provider.
 * Upgrade is only valid for anonymous identities.
 */
export function canUpgradeAnonymous(identity: IdentityRecord): boolean {
  return identity.isAnonymous;
}

// ---------------------------------------------------------------------------
// Claims helpers
// ---------------------------------------------------------------------------

/**
 * Returns the AccountId embedded in the identity's custom claims, or `null`
 * if claims are absent or malformed.
 *
 * The `accountId` claim is set by the account.module Server Action after
 * registration and is used to link the Firebase Auth identity to an Account aggregate.
 */
export function claimedAccountId(identity: IdentityRecord): IdentityId | null {
  return (identity.claims?.accountId as IdentityId | undefined) ?? null;
}

/**
 * Returns true when the identity's token requires a refresh.
 * A token is considered stale when the `claimsVersion` in custom claims
 * differs from the provided `expectedVersion`.
 *
 * This check supports the TOKEN_REFRESH_SIGNAL handshake pattern used by
 * identity.slice in the source repo: when a role or policy change occurs,
 * the signal document is written with the new version, and the frontend
 * must call `getIdToken(true)` to pick up the updated claims.
 */
export function isTokenStale(identity: IdentityRecord, expectedVersion: number): boolean {
  const claimsVersion = identity.claims?.claimsVersion;
  if (claimsVersion === undefined) return expectedVersion > 0;
  return claimsVersion < expectedVersion;
}

// ---------------------------------------------------------------------------
// Stale session detection
// ---------------------------------------------------------------------------

/**
 * Returns true when the identity session should be considered expired based
 * on the last sign-in time and the maximum allowed session duration (ms).
 *
 * Used by SessionCleanupService to identify sessions eligible for revocation.
 */
export function isSessionExpired(
  identity: IdentityRecord,
  maxDurationMs: number,
  nowMs: number = Date.now(),
): boolean {
  if (!identity.lastSignedInAt) return false;
  const lastSignIn = new Date(identity.lastSignedInAt).getTime();
  return nowMs - lastSignIn > maxDurationMs;
}

/**
 * Filters a list of IdentityRecords to those whose sessions have exceeded
 * `maxDurationMs`. Used by SessionCleanupService for bulk revocation.
 */
export function findExpiredSessions(
  identities: IdentityRecord[],
  maxDurationMs: number,
  nowMs: number = Date.now(),
): IdentityRecord[] {
  return identities.filter((id) => isSessionExpired(id, maxDurationMs, nowMs));
}

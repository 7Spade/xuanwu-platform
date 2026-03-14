/**
 * API Key domain services — pure, side-effect-free helpers for ApiKeyRecord.
 *
 * Derived from the key-management invariants in 7Spade/xuanwu identity.slice.
 * All functions are synchronous and infrastructure-independent.
 */

import type { ApiKeyRecord } from "./_api-key-entity";

// ---------------------------------------------------------------------------
// Status queries
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the key has passed its expiry date.
 * Keys with `expiresAt = null` never expire.
 */
export function isApiKeyExpired(key: ApiKeyRecord, now: string = new Date().toISOString()): boolean {
  if (!key.expiresAt) return false;
  return key.expiresAt < now;
}

/**
 * Returns `true` when the key is both active (not revoked) and not expired.
 */
export function isApiKeyUsable(key: ApiKeyRecord, now?: string): boolean {
  return key.isActive && !isApiKeyExpired(key, now);
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts API keys newest-first by `createdAt`.
 */
export function sortApiKeysByCreatedAt(keys: readonly ApiKeyRecord[]): ApiKeyRecord[] {
  return [...keys].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------------------------------------------------------------------------
// Counting
// ---------------------------------------------------------------------------

/**
 * Counts the number of currently active (not revoked, not expired) keys.
 */
export function countActiveApiKeys(keys: readonly ApiKeyRecord[], now?: string): number {
  return keys.filter((k) => isApiKeyUsable(k, now)).length;
}

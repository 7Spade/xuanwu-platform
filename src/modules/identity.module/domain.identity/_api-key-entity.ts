import type { ApiKeyId } from "./_value-objects";

// ---------------------------------------------------------------------------
// ApiKeyRecord — aggregate root for organisation API keys
// ---------------------------------------------------------------------------

/**
 * Represents a scoped API key issued to a namespace (organisation).
 *
 * Invariants:
 *   - A key belongs to exactly one namespace (identified by `namespaceSlug`).
 *   - The full key material is never persisted here; only a masked preview is stored.
 *   - Once revoked (`isActive = false`), the key cannot be reactivated.
 */
export interface ApiKeyRecord {
  /** Primary key — auto-generated UUID. */
  readonly id: ApiKeyId;
  /** The slug of the namespace that owns this key. */
  readonly namespaceSlug: string;
  /** Human-readable label assigned at creation time. */
  readonly name: string;
  /**
   * Last 8 characters of the raw key, prefixed with `…` for display.
   * Full key material is delivered once at creation and never stored.
   */
  readonly keyPreview: string;
  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
  /** Optional ISO-8601 expiry timestamp. Null means the key never expires. */
  readonly expiresAt: string | null;
  /** ISO-8601 timestamp of the most recent successful API request with this key. */
  readonly lastUsedAt: string | null;
  /** False when the key has been revoked. */
  readonly isActive: boolean;
}

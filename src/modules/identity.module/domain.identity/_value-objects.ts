import { z } from "zod";

// ---------------------------------------------------------------------------
// IdentityId
// ---------------------------------------------------------------------------

/** Opaque wrapper for the authenticated user's unique ID (e.g. Firebase UID). */
export const IdentityIdSchema = z.string().min(1, "IdentityId must not be empty");
export type IdentityId = z.infer<typeof IdentityIdSchema>;

export function makeIdentityId(raw: string): IdentityId {
  return IdentityIdSchema.parse(raw);
}

// ---------------------------------------------------------------------------
// IdentityProvider
// ---------------------------------------------------------------------------

/** Supported authentication providers. */
export const IdentityProviderSchema = z.enum([
  "email",
  "google",
  "github",
  "anonymous",
]);
export type IdentityProvider = z.infer<typeof IdentityProviderSchema>;

// ---------------------------------------------------------------------------
// ProviderUid
// ---------------------------------------------------------------------------

/** External UID issued by the identity provider. */
export const ProviderUidSchema = z.string().min(1, "ProviderUid must not be empty");
export type ProviderUid = z.infer<typeof ProviderUidSchema>;

// ---------------------------------------------------------------------------
// AuthClaims
// ---------------------------------------------------------------------------

/**
 * Custom claims embedded in the JWT token.
 * Populated by the auth claims infrastructure after account provisioning.
 */
export interface AuthClaims {
  readonly accountId: string;
  readonly accountType: "personal" | "organization";
  readonly role: string;
  /** Monotonically increasing version counter used to detect stale tokens. */
  readonly claimsVersion?: number;
}

// ---------------------------------------------------------------------------
// AuthUser
// ---------------------------------------------------------------------------

/**
 * Minimal authenticated user snapshot returned by auth provider operations.
 * Framework-agnostic — does not reference any Firebase SDK types.
 */
export interface AuthUser {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly photoURL: string | null;
}

// ---------------------------------------------------------------------------
// SessionToken
// ---------------------------------------------------------------------------

/** Short-lived access token string (e.g. Firebase ID token). */
export const SessionTokenSchema = z.string().min(1, "SessionToken must not be empty");
export type SessionToken = z.infer<typeof SessionTokenSchema>;

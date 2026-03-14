import type { IdentityRecord } from "./_entity";
import type { AuthUser } from "./_value-objects";

// ---------------------------------------------------------------------------
// IAuthProviderPort
// ---------------------------------------------------------------------------

/**
 * Port interface for the external authentication provider (e.g. Firebase Auth).
 * Implemented by the infrastructure adapter — never imported from domain or application code directly.
 */
export interface IAuthProviderPort {
  signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser>;
  createUserWithEmailAndPassword(email: string, password: string): Promise<AuthUser>;
  signInAnonymously(): Promise<AuthUser>;
  sendPasswordResetEmail(email: string): Promise<void>;
  updateProfile(user: AuthUser, profile: { displayName?: string; photoURL?: string }): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): AuthUser | null;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}

// ---------------------------------------------------------------------------
// IIdentityRepository
// ---------------------------------------------------------------------------

/**
 * Port interface for persisting identity records.
 * Implemented by the Firestore infrastructure adapter.
 */
export interface IIdentityRepository {
  findById(id: string): Promise<IdentityRecord | null>;
  save(identity: IdentityRecord): Promise<void>;
  deleteById(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// IAuthClaimsPort
// ---------------------------------------------------------------------------

/**
 * Port interface for reading and writing custom JWT claims.
 * Implemented by a server-side Firebase Admin SDK adapter.
 * Claims allow downstream services to enforce RBAC without an extra DB read.
 */
export interface IAuthClaimsPort {
  /**
   * Force-refresh the JWT token so that updated custom claims become visible
   * to the currently authenticated client.
   */
  emitRefreshSignal(accountId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// ISessionPort
// ---------------------------------------------------------------------------

/**
 * Port interface for session management (cookie-based server-side sessions).
 * Optional — used when the application needs server-side session tracking
 * beyond the default Firebase client-side token.
 */
export interface ISessionPort {
  /** Create a short-lived session cookie from a Firebase ID token. */
  createSessionCookie(idToken: string, expiresIn: number): Promise<string>;
  /** Verify and decode a session cookie. Returns null when invalid or expired. */
  verifySessionCookie(cookie: string): Promise<{ uid: string } | null>;
  /** Revoke all session cookies for the given user. */
  revokeRefreshTokens(uid: string): Promise<void>;
}

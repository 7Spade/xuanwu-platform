/**
 * Identity Firestore repository — implements IIdentityRepository port.
 *
 * Also provides a Firebase Auth client adapter implementing IAuthProviderPort,
 * and a token-refresh signal writer implementing IAuthClaimsPort.
 *
 * All Firebase SDK calls are isolated to this file; the domain and application
 * layers never import Firebase directly.
 */

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreate,
  signInAnonymously as fbSignInAnon,
  sendPasswordResetEmail as fbSendReset,
  updateProfile as fbUpdateProfile,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import type {
  IIdentityRepository,
  IAuthProviderPort,
  IAuthClaimsPort,
} from "../domain.identity/_ports";
import type { IdentityRecord } from "../domain.identity/_entity";
import type { AuthUser } from "../domain.identity/_value-objects";

const IDENTITIES_COLLECTION = "identities";
const TOKEN_REFRESH_SIGNALS_COLLECTION = "tokenRefreshSignals";

// ---------------------------------------------------------------------------
// Mapper helpers
// ---------------------------------------------------------------------------

/** Maps a raw Firestore document snapshot to an IdentityRecord. */
function docToIdentityRecord(id: string, data: Record<string, unknown>): IdentityRecord {
  return {
    id,
    provider: data.provider as IdentityRecord["provider"],
    providerUid: (data.providerUid ?? id) as string,
    accountId: (data.accountId ?? null) as string | null,
    email: (data.email ?? null) as string | null,
    displayName: (data.displayName ?? null) as string | null,
    isAnonymous: Boolean(data.isAnonymous),
    claims: (data.claims ?? null) as IdentityRecord["claims"],
    createdAt: (data.createdAt ?? new Date().toISOString()) as string,
    lastSignedInAt: (data.lastSignedInAt ?? new Date().toISOString()) as string,
  };
}

/** Maps a Firebase Auth User to the domain AuthUser snapshot. */
function firebaseUserToAuthUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

// ---------------------------------------------------------------------------
// IIdentityRepository implementation
// ---------------------------------------------------------------------------

export class FirestoreIdentityRepository implements IIdentityRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: string): Promise<IdentityRecord | null> {
    const ref = doc(this.db, IDENTITIES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return docToIdentityRecord(snap.id, snap.data() as Record<string, unknown>);
  }

  async save(identity: IdentityRecord): Promise<void> {
    const ref = doc(this.db, IDENTITIES_COLLECTION, identity.id);
    await setDoc(ref, identity, { merge: true });
  }

  async deleteById(id: string): Promise<void> {
    const ref = doc(this.db, IDENTITIES_COLLECTION, id);
    await deleteDoc(ref);
  }
}

// ---------------------------------------------------------------------------
// IAuthProviderPort implementation — Firebase Auth client SDK
// ---------------------------------------------------------------------------

export class FirebaseAuthAdapter implements IAuthProviderPort {
  private get auth() {
    return getAuth();
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
    const cred = await fbSignIn(this.auth, email, password);
    return firebaseUserToAuthUser(cred.user);
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
    const cred = await fbCreate(this.auth, email, password);
    return firebaseUserToAuthUser(cred.user);
  }

  async signInAnonymously(): Promise<AuthUser> {
    const cred = await fbSignInAnon(this.auth);
    return firebaseUserToAuthUser(cred.user);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await fbSendReset(this.auth, email);
  }

  async updateProfile(
    user: AuthUser,
    profile: { displayName?: string; photoURL?: string },
  ): Promise<void> {
    // updateProfile requires the live Firebase User object; we re-fetch it from currentUser.
    const currentUser = this.auth.currentUser;
    if (currentUser && currentUser.uid === user.uid) {
      await fbUpdateProfile(currentUser, profile);
    }
  }

  async signOut(): Promise<void> {
    await fbSignOut(this.auth);
  }

  getCurrentUser(): AuthUser | null {
    const user = this.auth.currentUser;
    return user ? firebaseUserToAuthUser(user) : null;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return fbOnAuthStateChanged(this.auth, (user) =>
      callback(user ? firebaseUserToAuthUser(user) : null),
    );
  }
}

// ---------------------------------------------------------------------------
// IAuthClaimsPort implementation — TOKEN_REFRESH_SIGNAL via Firestore
// ---------------------------------------------------------------------------

/**
 * Writes a TOKEN_REFRESH_SIGNAL document to Firestore.
 * The frontend listens via `onSnapshot('tokenRefreshSignals/{accountId}')`
 * and must call `getIdToken(true)` on receiving the signal to pick up
 * updated custom claims (role/policy changes).
 *
 * Derived from 7Spade/xuanwu identity.slice/_claims-handler.ts.
 */
export class FirestoreAuthClaimsAdapter implements IAuthClaimsPort {
  private get db() {
    return getFirestore();
  }

  async emitRefreshSignal(accountId: string): Promise<void> {
    const ref = doc(this.db, TOKEN_REFRESH_SIGNALS_COLLECTION, accountId);
    await setDoc(ref, {
      accountId,
      reason: "claims:refreshed",
      issuedAt: new Date().toISOString(),
    });
  }
}

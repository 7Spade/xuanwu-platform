"use client";
/**
 * Client-side auth actions for identity.module.
 *
 * These wrap the domain use-cases with the real Firebase Auth adapter,
 * making them callable directly from client components.
 *
 * IMPORTANT: This file must NOT have 'use server' — Firebase Web SDK
 * authentication is inherently client-side (uses browser session state).
 */

import {
  getAuth,
  onAuthStateChanged as fbOnAuthStateChanged,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbRegister,
  signInAnonymously as fbSignInAnon,
  sendPasswordResetEmail as fbSendReset,
  signOut as fbSignOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { getFirebaseApp } from "@/infrastructure/firebase/app";
import type { Result } from "@/shared";
import { ok, fail } from "@/shared";
import type { AuthUser } from "./domain.identity/_value-objects";

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

/** Signs in with email + password. Returns Result<uid>. */
export async function clientSignIn(
  email: string,
  password: string,
): Promise<Result<string>> {
  try {
    const cred = await fbSignIn(getFirebaseAuth(), email, password);
    return ok(cred.user.uid);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Registers a new user with email + password + displayName. Returns Result<uid>. */
export async function clientRegister(
  email: string,
  password: string,
  displayName: string,
): Promise<Result<string>> {
  try {
    const cred = await fbRegister(getFirebaseAuth(), email, password);
    await updateProfile(cred.user, { displayName });
    return ok(cred.user.uid);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Signs in anonymously. Returns Result<uid>. */
export async function clientSignInAnonymously(): Promise<Result<string>> {
  try {
    const cred = await fbSignInAnon(getFirebaseAuth());
    return ok(cred.user.uid);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Sends a password reset email. Returns Result<void>. */
export async function clientSendPasswordResetEmail(
  email: string,
): Promise<Result<void>> {
  try {
    await fbSendReset(getFirebaseAuth(), email);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Signs out the current user. Returns Result<void>. */
export async function clientSignOut(): Promise<Result<void>> {
  try {
    await fbSignOut(getFirebaseAuth());
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Subscribes to Firebase Auth state changes.
 * Adapts Firebase `User` to the domain `AuthUser` type so callers outside
 * identity.module do not depend on the Firebase SDK directly.
 *
 * @returns An unsubscribe function.
 */
export function clientOnAuthStateChanged(
  callback: (user: AuthUser | null) => void,
): () => void {
  const auth = getFirebaseAuth();
  return fbOnAuthStateChanged(auth, (fbUser) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    callback({
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
    });
  });
}

/**
 * Updates the current user's display name in Firebase Auth.
 * Returns Result<void>.
 */
export async function clientUpdateProfile(
  displayName: string,
): Promise<Result<void>> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return fail(new Error("User not authenticated"));
    await updateProfile(user, { displayName });
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Re-authenticates with the current password then sets a new password.
 * Returns Result<void>.
 */
export async function clientChangePassword(
  currentPassword: string,
  newPassword: string,
): Promise<Result<void>> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return fail(new Error("User not authenticated"));
    if (!user.email) return fail(new Error("User email not available for re-authentication"));
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

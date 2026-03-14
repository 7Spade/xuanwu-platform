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
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbRegister,
  signInAnonymously as fbSignInAnon,
  sendPasswordResetEmail as fbSendReset,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import { getFirebaseApp } from "@/infrastructure/firebase/app";
import type { Result } from "@/shared";
import { ok, fail } from "@/shared";

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

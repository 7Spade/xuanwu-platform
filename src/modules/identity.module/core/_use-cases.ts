import type { IdentityProvider, AuthClaims, AuthUser } from "../domain.identity/_value-objects";
import type { IAuthProviderPort, IIdentityRepository } from "../domain.identity/_ports";
import { ok, fail } from "@/shared";
import type { Result } from "@/shared";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

/** Public projection of an Identity — safe to expose at the application boundary. */
export interface IdentityDTO {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly photoURL: string | null;
  readonly provider: IdentityProvider;
  readonly isAnonymous: boolean;
  readonly claims: AuthClaims | null;
}

/** Minimal session status DTO used by UI to decide which auth flow to show. */
export interface SessionStatusDTO {
  readonly isAuthenticated: boolean;
  readonly identity: IdentityDTO | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authUserToDTO(user: AuthUser, provider: IdentityProvider): IdentityDTO {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider,
    isAnonymous: provider === "anonymous",
    claims: null,
  };
}

// ---------------------------------------------------------------------------
// Use Cases
// ---------------------------------------------------------------------------

/**
 * SignInUseCase
 * Authenticates an existing user with email + password.
 * Returns the authenticated UID on success.
 */
export async function signIn(
  auth: IAuthProviderPort,
  email: string,
  password: string,
): Promise<Result<string>> {
  try {
    const user = await auth.signInWithEmailAndPassword(email, password);
    return ok(user.uid);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * SignOutUseCase
 * Signs out the currently authenticated user.
 */
export async function signOut(auth: IAuthProviderPort): Promise<Result<void>> {
  try {
    await auth.signOut();
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * SignInAnonymouslyUseCase
 * Creates a transient anonymous session. The anonymous identity can be upgraded
 * to a permanent provider identity later without data loss.
 */
export async function signInAnonymously(
  auth: IAuthProviderPort,
): Promise<Result<string>> {
  try {
    const user = await auth.signInAnonymously();
    return ok(user.uid);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * SendPasswordResetEmailUseCase
 * Sends a password reset link to the given email address.
 */
export async function sendPasswordResetEmail(
  auth: IAuthProviderPort,
  email: string,
): Promise<Result<void>> {
  try {
    await auth.sendPasswordResetEmail(email);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * RegisterIdentityUseCase
 * Creates a new Firebase Auth account, sets the display name, and returns
 * the new uid. Account provisioning (creating the Account aggregate) is the
 * responsibility of account.module and must be called by the orchestrating
 * server action after this use case succeeds.
 */
export async function registerIdentity(
  auth: IAuthProviderPort,
  email: string,
  password: string,
  displayName: string,
): Promise<Result<string>> {
  try {
    const user = await auth.createUserWithEmailAndPassword(email, password);
    await auth.updateProfile(user, { displayName });
    return ok(user.uid);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * GetCurrentIdentityQuery
 * Returns the current auth user as an IdentityDTO, or null when not authenticated.
 */
export function getCurrentIdentity(
  auth: IAuthProviderPort,
): IdentityDTO | null {
  const user = auth.getCurrentUser();
  if (!user) return null;
  return authUserToDTO(user, user.uid.startsWith("anon") ? "anonymous" : "email");
}

/**
 * GetIdentityByIdQuery
 * Loads a persisted IdentityRecord from the repository and projects it as a DTO.
 */
export async function getIdentityById(
  repo: IIdentityRepository,
  id: string,
): Promise<Result<IdentityDTO | null>> {
  try {
    const record = await repo.findById(id);
    if (!record) return ok(null);
    const dto: IdentityDTO = {
      uid: record.id,
      email: record.email,
      displayName: record.displayName,
      photoURL: null,
      provider: record.provider,
      isAnonymous: record.isAnonymous,
      claims: record.claims,
    };
    return ok(dto);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// API Key use cases
// ---------------------------------------------------------------------------

import type { IApiKeyRepository } from "../domain.identity/_ports";
import type { ApiKeyRecord } from "../domain.identity/_api-key-entity";
import { sortApiKeysByCreatedAt } from "../domain.identity/_api-key-service";

/** DTO exposed at the application boundary — mirrors ApiKeyRecord. */
export interface ApiKeyDTO {
  readonly id: string;
  readonly namespaceSlug: string;
  readonly name: string;
  readonly keyPreview: string;
  readonly createdAt: string;
  readonly expiresAt: string | null;
  readonly lastUsedAt: string | null;
  readonly isActive: boolean;
}

function apiKeyRecordToDTO(r: ApiKeyRecord): ApiKeyDTO {
  return {
    id: r.id,
    namespaceSlug: r.namespaceSlug,
    name: r.name,
    keyPreview: r.keyPreview,
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
    lastUsedAt: r.lastUsedAt,
    isActive: r.isActive,
  };
}

/**
 * GetApiKeysBySlugQuery
 * Returns all API keys for the given namespace slug, sorted newest-first.
 */
export async function getApiKeysBySlug(
  repo: IApiKeyRepository,
  namespaceSlug: string,
): Promise<Result<ApiKeyDTO[]>> {
  try {
    const records = await repo.findByNamespaceSlug(namespaceSlug);
    const sorted = sortApiKeysByCreatedAt(records);
    return ok(sorted.map(apiKeyRecordToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

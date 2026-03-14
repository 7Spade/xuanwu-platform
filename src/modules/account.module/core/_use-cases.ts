import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { AccountEntity, AccountProfile } from "../domain.account/_entity";
import { buildPersonalAccount, buildOrganizationAccount } from "../domain.account/_entity";
import type { AccountId, AccountType } from "../domain.account/_value-objects";
import type { IAccountRepository } from "../domain.account/_ports";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

/** Public projection of an Account — safe to expose at the application boundary. */
export interface AccountDTO {
  readonly id: string;
  readonly handle: string | null;
  readonly accountType: AccountType;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly bio: string | null;
  readonly badgeSlugs: readonly string[];
  readonly ownerId: string | null;
  readonly createdAt: string;
}

/** Minimal public profile — suitable for user cards, @mentions, and search results. */
export interface PublicProfileDTO {
  readonly id: string;
  readonly handle: string | null;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly bio: string | null;
  readonly badgeSlugs: readonly string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entityToDTO(account: AccountEntity): AccountDTO {
  return {
    id: account.id,
    handle: account.handle,
    accountType: account.accountType,
    displayName: account.profile.displayName,
    avatarUrl: account.profile.avatarUrl,
    bio: account.profile.bio,
    badgeSlugs: account.profile.badgeSlugs,
    ownerId: account.ownerId,
    createdAt: account.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Use Cases
// ---------------------------------------------------------------------------

/**
 * CreatePersonalAccountUseCase
 * Called by identity.module after a new user registration succeeds.
 * Creates the personal Account aggregate keyed on the user's IdentityId.
 */
export async function createPersonalAccount(
  repo: IAccountRepository,
  uid: string,
  displayName: string,
): Promise<Result<AccountDTO>> {
  try {
    const now = new Date().toISOString();
    const account = buildPersonalAccount(uid as AccountId, displayName, now);
    await repo.save(account);
    return ok(entityToDTO(account));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * CreateOrganizationAccountUseCase
 * Creates an org Account owned by the caller's personal account.
 */
export async function createOrganizationAccount(
  repo: IAccountRepository,
  orgId: string,
  ownerId: string,
  displayName: string,
): Promise<Result<AccountDTO>> {
  try {
    const now = new Date().toISOString();
    const account = buildOrganizationAccount(
      orgId as AccountId,
      ownerId as AccountId,
      displayName,
      now,
    );
    await repo.save(account);
    return ok(entityToDTO(account));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * UpdateAccountProfileUseCase
 * Updates mutable profile fields on any account type.
 * Returns NotFoundError when the account does not exist.
 */
export async function updateAccountProfile(
  repo: IAccountRepository,
  id: string,
  updates: Partial<Pick<AccountProfile, "displayName" | "avatarUrl" | "bio">>,
): Promise<Result<AccountDTO>> {
  try {
    const existing = await repo.findById(id as AccountId);
    if (!existing) {
      return fail(new Error(`Account not found: ${id}`));
    }
    const now = new Date().toISOString();
    const updated: AccountEntity = {
      ...existing,
      profile: { ...existing.profile, ...updates },
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * GetAccountByIdUseCase
 * Returns an AccountDTO for the given account ID, or null when not found.
 */
export async function getAccountById(
  repo: IAccountRepository,
  id: string,
): Promise<Result<AccountDTO | null>> {
  try {
    const account = await repo.findById(id as AccountId);
    return ok(account ? entityToDTO(account) : null);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * GetPublicProfileUseCase
 * Returns the minimal public profile for user-card and @mention display.
 */
export async function getPublicProfile(
  repo: IAccountRepository,
  id: string,
): Promise<Result<PublicProfileDTO | null>> {
  try {
    const account = await repo.findById(id as AccountId);
    if (!account) return ok(null);
    const dto: PublicProfileDTO = {
      id: account.id,
      handle: account.handle,
      displayName: account.profile.displayName,
      avatarUrl: account.profile.avatarUrl,
      bio: account.profile.bio,
      badgeSlugs: account.profile.badgeSlugs,
    };
    return ok(dto);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

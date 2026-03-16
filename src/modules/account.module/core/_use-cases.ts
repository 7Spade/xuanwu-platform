import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { AccountEntity, AccountProfile } from "../domain.account/_entity";
import { buildPersonalAccount, buildOrganizationAccount } from "../domain.account/_entity";
import type { AccountId, AccountType, MemberRole, MembershipStatus, AccountHandle } from "../domain.account/_value-objects";
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

/** Membership record projection — used by the members settings view. */
export interface MemberDTO {
  readonly id: string;
  readonly accountId: string;
  readonly role: MemberRole;
  readonly status: MembershipStatus;
  readonly invitedAt: string;
  readonly acceptedAt: string | null;
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

/**
 * GetOrgMembersByHandleUseCase
 * Loads the org account by its handle (slug) and returns its members array.
 * Returns an empty array for personal accounts or when the org is not found.
 */
export async function getOrgMembersByHandle(
  repo: IAccountRepository,
  handle: string,
): Promise<Result<MemberDTO[]>> {
  try {
    const account = await repo.findByHandle(handle as AccountHandle);
    if (!account || account.accountType !== "organization") return ok([]);
    const members = (account.members ?? []).map((m) => ({
      id: m.id,
      accountId: m.accountId,
      role: m.role,
      status: m.status,
      invitedAt: m.invitedAt,
      acceptedAt: m.acceptedAt,
    }));
    return ok(members);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * GetOrganizationsByOwnerIdUseCase
 * Returns all organization accounts owned by the given personal account ID.
 * Used by the AccountSwitcher to populate the account context list.
 */
export async function getOrganizationsByOwnerId(
  repo: IAccountRepository,
  ownerId: string,
): Promise<Result<AccountDTO[]>> {
  try {
    const entities = await repo.findOrganizationsByOwnerId(ownerId as AccountId);
    return ok(entities.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * GetUserRoleInOrganizationUseCase
 * Returns the MemberRole of a user within a specific organization.
 * Returns "owner" when the user is the org owner.
 * Returns the membership role when the user is an active non-owner member.
 * Returns null when the user is not a member or the organization doesn't exist.
 */
export async function getUserRoleInOrganization(
  repo: IAccountRepository,
  userId: string,
  orgId: string,
): Promise<Result<MemberRole | null>> {
  try {
    const org = await repo.findById(orgId as AccountId);
    if (!org || org.accountType !== "organization") return ok(null);
    // Check ownership first — owner is not stored in the members array.
    if (org.ownerId === userId) return ok("owner");
    const member = org.members?.find((m) => m.accountId === userId && m.status === "active");
    return ok(member?.role ?? null);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// UserOrganizationDTO — org + the calling user's role in that org
// ---------------------------------------------------------------------------

/** An organization account together with the querying user's role. */
export interface UserOrganizationDTO {
  readonly org: AccountDTO;
  readonly userRole: MemberRole;
}

/**
 * GetUserOrganizationsUseCase
 * Returns all organization accounts the user is associated with, together with
 * their role in each one:
 *   - Orgs they own → role "owner"
 *   - Orgs where they hold an active membership → that membership role
 *
 * Deduplicates by org ID so the same org is never returned twice.
 */
export async function getUserOrganizations(
  repo: IAccountRepository,
  userId: string,
): Promise<Result<UserOrganizationDTO[]>> {
  try {
    const [ownedEntities, memberEntities] = await Promise.all([
      repo.findOrganizationsByOwnerId(userId as AccountId),
      repo.findOrganizationsByMemberId(userId as AccountId),
    ]);

    const seen = new Set<string>();
    const result: UserOrganizationDTO[] = [];

    for (const entity of ownedEntities) {
      if (!seen.has(entity.id)) {
        seen.add(entity.id);
        result.push({ org: entityToDTO(entity), userRole: "owner" });
      }
    }

    for (const entity of memberEntities) {
      if (!seen.has(entity.id)) {
        seen.add(entity.id);
        const member = entity.members?.find(
          (m) => m.accountId === userId && m.status === "active",
        );
        if (member) {
          result.push({ org: entityToDTO(entity), userRole: member.role });
        }
      }
    }

    return ok(result);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

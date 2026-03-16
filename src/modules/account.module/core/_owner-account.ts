import type { AccountDTO } from "./_use-cases";

/**
 * Resolves the owner account ID used for organization ownership queries/writes.
 *
 * The canonical owner ID is the personal Account ID (account.id). For backward
 * compatibility, we fall back to Firebase Auth uid when the personal account
 * has not been loaded yet.
 */
export function resolveOrganizationOwnerAccountId(
  account: AccountDTO | null,
  userUid: string | null,
): string | null {
  return account?.id ?? userUid;
}

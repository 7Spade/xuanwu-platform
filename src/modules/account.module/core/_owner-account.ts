import type { AccountDTO } from "./_use-cases";

/**
 * Resolves the canonical owner account id used for organization ownership.
 *
 * Prefer personal account id once the account record is hydrated. Fallback to
 * Firebase uid during initial sign-in flows where account hydration has not
 * completed yet.
 */
export function resolveOwnerAccountId(
  account: AccountDTO | null,
  firebaseUid: string | null,
): string | null {
  if (account?.id) return account.id;
  if (firebaseUid) return firebaseUid;
  return null;
}

/**
 * Resolve organization owner lookup id for account context queries.
 *
 * Prefer the hydrated personal account id when available, and fall back to
 * Firebase uid while account hydration is still pending.
 */
export function resolveOrganizationOwnerId(
  personalAccountId: string | null | undefined,
  firebaseUid: string,
): string {
  if (personalAccountId && personalAccountId.trim().length > 0) {
    return personalAccountId;
  }

  return firebaseUid;
}

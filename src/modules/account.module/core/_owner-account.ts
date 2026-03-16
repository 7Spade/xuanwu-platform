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

/**
 * Resolve personal account lookup id from auth claims.
 *
 * Prefer the accountId claim when it is a non-empty string, otherwise fall
 * back to Firebase uid for backward compatibility.
 */
export function resolvePersonalAccountLookupId(
  claimsAccountId: unknown,
  firebaseUid: string,
): string {
  if (typeof claimsAccountId === "string" && claimsAccountId.trim().length > 0) {
    return claimsAccountId;
  }

  return firebaseUid;
}

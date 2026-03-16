import type { AccountDTO } from "./_use-cases";

const ACTIVE_ACCOUNT_STORAGE_KEY = "xuanwu.activeAccountId";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readStoredActiveAccountId(): string | null {
  return getStorage()?.getItem(ACTIVE_ACCOUNT_STORAGE_KEY) ?? null;
}

export function writeStoredActiveAccountId(accountId: string | null): void {
  const storage = getStorage();
  if (!storage) return;

  if (accountId) {
    storage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, accountId);
    return;
  }

  storage.removeItem(ACTIVE_ACCOUNT_STORAGE_KEY);
}

export function resolveActiveAccount(
  personalAccount: AccountDTO | null,
  organizations: AccountDTO[],
  preferredAccountId: string | null,
): AccountDTO | null {
  if (!personalAccount) return null;

  if (!preferredAccountId || preferredAccountId === personalAccount.id) {
    return personalAccount;
  }

  return organizations.find((org) => org.id === preferredAccountId) ?? personalAccount;
}

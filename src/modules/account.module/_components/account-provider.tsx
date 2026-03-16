"use client";
/**
 * AccountProvider — application-layer React context for the authenticated user's account.
 *
 * Source equivalent: account.slice/domain.profile/_hooks/use-current-account.ts
 * Adapted: wraps onAuthStateChanged + FirestoreAccountRepository into a single
 * React Context so all child components share one subscription instead of each
 * creating their own.
 *
 * Architecture note: lives in account.module/_components (Presentation layer)
 * but orchestrates account.module infra (via getAccountById use-case) — this
 * is the correct Presentation → Application → Infrastructure flow.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getFirebaseAuth, onAuthStateChanged, type User } from "@/infrastructure/firebase/client";
import {
  getAccountById,
  getOrganizationsByOwnerId,
  getUserRoleInOrganization,
  type AccountDTO,
  type MemberRole,
} from "@/modules/account.module";

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

export interface AccountContextValue {
  /** The Firebase Auth user (null while loading or signed-out). */
  user: User | null;
  /** The Firestore AccountDTO for the current user (null until loaded or if missing). */
  account: AccountDTO | null;
  /** Organization accounts owned by the current user. */
  organizations: AccountDTO[];
  /** True while the initial auth + account fetch is in-flight. */
  loading: boolean;
  /** True while organizations are being fetched after account resolves. */
  orgsLoading: boolean;
  /**
   * The currently active account context (personal or one of the organizations).
   * Defaults to the personal account once loaded.
   */
  activeAccount: AccountDTO | null;
  /**
   * The current user's role in the activeAccount.
   * Null for personal accounts; MemberRole ("owner"|"admin"|"member"|"viewer") for orgs.
   */
  activeAccountRole: MemberRole | null;
  /** Switch the active account context. Pass null to reset to personal. */
  setActiveAccount: (account: AccountDTO | null) => void;
  /** Re-fetch the list of organizations for the current user. */
  refreshOrganizations: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AccountContext = createContext<AccountContextValue>({
  user: null,
  account: null,
  organizations: [],
  loading: true,
  orgsLoading: false,
  activeAccount: null,
  activeAccountRole: null,
  setActiveAccount: () => undefined,
  refreshOrganizations: () => Promise.resolve(),
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountDTO | null>(null);
  const [organizations, setOrganizations] = useState<AccountDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [activeAccount, setActiveAccountState] = useState<AccountDTO | null>(null);
  const [activeAccountRole, setActiveAccountRole] = useState<MemberRole | null>(null);

  const setActiveAccount = useCallback((next: AccountDTO | null) => {
    setActiveAccountState(next);
    // When switching to an org, fetch the user's role in that org.
    // Personal account always has null role.
    if (next && next.accountType === "organization" && user) {
      getUserRoleInOrganization(user.uid, next.id).then((result: any) => {
        setActiveAccountRole(result.ok ? result.value : null);
      });
    } else {
      setActiveAccountRole(null);
    }
  }, [user]);

  const refreshOrganizations = useCallback(async () => {
    if (!user) return;
    setOrgsLoading(true);
    try {
      const orgsResult = await getOrganizationsByOwnerId(user.uid);
      setOrganizations(orgsResult.ok ? orgsResult.value : []);
    } finally {
      setOrgsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setAccount(null);
        setOrganizations([]);
        setActiveAccountState(null);
        setLoading(false);
        return;
      }

      try {
        // Load personal account
        const result = await getAccountById(firebaseUser.uid);
        const personalAccount = result.ok ? result.value : null;
        setAccount(personalAccount);

        // Always reset to personal account when auth state changes (new sign-in)
        setActiveAccountState(personalAccount);

        // Load owned organizations
        setOrgsLoading(true);
        try {
          const orgsResult = await getOrganizationsByOwnerId(firebaseUser.uid);
          setOrganizations(orgsResult.ok ? orgsResult.value : []);
        } finally {
          setOrgsLoading(false);
        }
      } catch {
        setAccount(null);
        setOrganizations([]);
        setActiveAccountState(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AccountContext.Provider
      value={{
        user,
        account,
        organizations,
        loading,
        orgsLoading,
        activeAccount,
        activeAccountRole,
        setActiveAccount,
        refreshOrganizations,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useCurrentAccount — returns the current user's Firebase Auth user + AccountDTO.
 *
 * Must be called inside <AccountProvider>.
 * Returns { user, account, loading, organizations, orgsLoading, activeAccount, setActiveAccount }.
 */
export function useCurrentAccount(): AccountContextValue {
  return useContext(AccountContext);
}

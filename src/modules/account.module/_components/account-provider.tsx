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

import {
  clientOnAuthStateChanged,
  type AuthUser,
} from "@/modules/identity.module";
import {
  getAccountById,
  getUserOrganizations,
  type AccountDTO,
  type MemberRole,
} from "@/modules/account.module";

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

export interface AccountContextValue {
  /** The authenticated user identity (null while loading or signed-out). */
  user: AuthUser | null;
  /** The Firestore AccountDTO for the current user (null until loaded or if missing). */
  account: AccountDTO | null;
  /**
   * All organization accounts the user is associated with (owned or member).
   * Includes orgs owned by the user AND orgs where the user has an active membership.
   */
  organizations: AccountDTO[];
  /**
   * Maps each organization ID to the current user's role in that org.
   * Use this to read roles for all organizations without extra fetches.
   */
  orgRoles: Record<string, MemberRole>;
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
   * Derived from orgRoles map.
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
  orgRoles: {},
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [account, setAccount] = useState<AccountDTO | null>(null);
  const [organizations, setOrganizations] = useState<AccountDTO[]>([]);
  const [orgRoles, setOrgRoles] = useState<Record<string, MemberRole>>({});
  const [loading, setLoading] = useState(true);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [activeAccount, setActiveAccountState] = useState<AccountDTO | null>(null);

  /** Applies a getUserOrganizations result to state. */
  const applyOrgsResult = useCallback(
    (result: Awaited<ReturnType<typeof getUserOrganizations>>) => {
      if (result.ok) {
        setOrganizations(result.value.map((r) => r.org));
        const roles: Record<string, MemberRole> = {};
        for (const r of result.value) roles[r.org.id] = r.userRole;
        setOrgRoles(roles);
      } else {
        setOrganizations([]);
        setOrgRoles({});
      }
    },
    [],
  );

  const setActiveAccount = useCallback((next: AccountDTO | null) => {
    setActiveAccountState(next);
  }, []);

  const refreshOrganizations = useCallback(async () => {
    if (!user) return;
    setOrgsLoading(true);
    try {
      applyOrgsResult(await getUserOrganizations(user.uid));
    } finally {
      setOrgsLoading(false);
    }
  }, [user, applyOrgsResult]);

  useEffect(() => {
    const unsubscribe = clientOnAuthStateChanged(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setAccount(null);
        setOrganizations([]);
        setOrgRoles({});
        setActiveAccountState(null);
        setLoading(false);
        return;
      }

      try {
        // Load personal account
        const result = await getAccountById(authUser.uid);
        const personalAccount = result.ok ? result.value : null;
        setAccount(personalAccount);

        // Always reset to personal account when auth state changes (new sign-in)
        setActiveAccountState(personalAccount);

        // Load all organizations (owned + member) with roles
        setOrgsLoading(true);
        try {
          applyOrgsResult(await getUserOrganizations(authUser.uid));
        } finally {
          setOrgsLoading(false);
        }
      } catch {
        setAccount(null);
        setOrganizations([]);
        setOrgRoles({});
        setActiveAccountState(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Derive activeAccountRole from the orgRoles map (no extra fetch needed).
  const activeAccountRole: MemberRole | null =
    activeAccount && activeAccount.accountType === "organization"
      ? (orgRoles[activeAccount.id] ?? null)
      : null;

  return (
    <AccountContext.Provider
      value={{
        user,
        account,
        organizations,
        orgRoles,
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
 * Returns { user, account, loading, organizations, orgRoles, orgsLoading, activeAccount,
 *           activeAccountRole, setActiveAccount, refreshOrganizations }.
 */
export function useCurrentAccount(): AccountContextValue {
  return useContext(AccountContext);
}

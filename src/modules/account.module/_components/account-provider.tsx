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
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

import { getFirebaseApp } from "@/infrastructure/firebase/app";
import { getAccountById, type AccountDTO } from "@/modules/account.module/core/_use-cases";
import { FirestoreAccountRepository } from "@/modules/account.module/infra.firestore/_repository";

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

export interface AccountContextValue {
  /** The Firebase Auth user (null while loading or signed-out). */
  user: User | null;
  /** The Firestore AccountDTO for the current user (null until loaded or if missing). */
  account: AccountDTO | null;
  /** True while the initial auth + account fetch is in-flight. */
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AccountContext = createContext<AccountContextValue>({
  user: null,
  account: null,
  loading: true,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(getFirebaseApp());

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setAccount(null);
        setLoading(false);
        return;
      }

      try {
        const repo = new FirestoreAccountRepository();
        const result = await getAccountById(repo, firebaseUser.uid);
        setAccount(result.ok ? result.value : null);
      } catch {
        setAccount(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AccountContext.Provider value={{ user, account, loading }}>
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
 * Returns { user, account, loading } where `loading` is true during the
 * initial auth state resolution.
 */
export function useCurrentAccount(): AccountContextValue {
  return useContext(AccountContext);
}

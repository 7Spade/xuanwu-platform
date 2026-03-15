"use client";
/**
 * AuthView — Smart auth container.
 *
 * Manages all authentication state and delegates rendering to sub-components.
 * Renders the full-page auth flow with login/register tabs and password reset dialog.
 */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useTranslation } from "@/shared/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/design-system/primitives/ui/dialog";

import {
  clientSignIn,
  clientRegister,
  clientSignInAnonymously,
} from "../_client-actions";
import { AuthTabsRoot } from "./auth-tabs-root";
import { ResetPasswordForm } from "./reset-password-form";

/**
 * Resolves the post-login destination from the `callbackUrl` search parameter.
 *
 * Security: uses the URL constructor with a dummy base to fully parse the
 * value. Only paths whose resolved origin matches the dummy base (i.e. purely
 * relative paths with no host) are accepted. This prevents open-redirect
 * attacks including encoded sequences like `/%2f` or protocol-relative URLs.
 *
 * Falls back to `fallback` (default `/onboarding`) when no safe URL is found.
 */
function resolvePostLoginUrl(
  searchParams: ReturnType<typeof useSearchParams>,
  fallback = "/onboarding",
): string {
  const raw = searchParams.get("callbackUrl");
  if (raw) {
    try {
      const base = "https://placeholder.invalid";
      const resolved = new URL(raw, base);
      // Accept only if the URL stayed within our dummy base (no external host).
      if (resolved.origin === base) {
        return resolved.pathname + resolved.search + resolved.hash;
      }
    } catch {
      // Malformed URL — fall through to default.
    }
  }
  return fallback;
}

export function AuthView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslation("zh-TW");

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuth = async (type: "login" | "register") => {
    setIsLoading(true);
    setAuthError(null);
    try {
      let result;
      if (type === "login") {
        result = await clientSignIn(email, password);
      } else {
        if (!name.trim()) {
          setAuthError(t("auth.pleaseSetDisplayName"));
          return;
        }
        result = await clientRegister(email, password, name);
      }
      if (!result.ok) {
        setAuthError(result.error.message);
        return;
      }
      // New users (register) always go through onboarding.
      // Returning users (login) honour ?callbackUrl, defaulting to /onboarding.
      router.push(
        type === "register" ? "/onboarding" : resolvePostLoginUrl(searchParams),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await clientSignInAnonymously();
      if (!result.ok) {
        setAuthError(result.error.message);
        return;
      }
      router.push(resolvePostLoginUrl(searchParams));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Subtle radial background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary)/0.15), transparent)",
        }}
      />

      {authError && (
        <div className="absolute top-4 z-20 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {authError}
        </div>
      )}

      <AuthTabsRoot
        isLoading={isLoading}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        handleAuth={handleAuth}
        handleAnonymous={handleAnonymous}
        openResetDialog={() => setIsResetOpen(true)}
      />

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] border-border/40 bg-card/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wide">
              {t("auth.resetPassword")}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <ResetPasswordForm
              defaultEmail={email}
              onSuccess={() => setIsResetOpen(false)}
              onCancel={() => setIsResetOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

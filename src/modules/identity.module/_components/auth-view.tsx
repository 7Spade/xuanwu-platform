"use client";
/**
 * AuthView — Smart auth container.
 *
 * Manages all authentication state and delegates rendering to sub-components.
 * Renders the full-page auth flow with login/register tabs and password reset dialog.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export function AuthView() {
  const router = useRouter();
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
      router.push("/");
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
      router.push("/");
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

"use client";
/**
 * SecurityView — password change form using Firebase Auth.
 *
 * Source: account.slice/domain.profile/_components/security-card.tsx
 * Adapted: uses EmailAuthProvider.credential + reauthenticateWithCredential + updatePassword
 */

import { KeyRound, Save } from "lucide-react";
import { useState } from "react";

import { clientChangePassword } from "@/modules/identity.module";
import { useTranslation } from "@/shared/i18n";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";

export function SecurityView() {
  const t = useTranslation("zh-TW");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const handleChange = async () => {
    setStatus("saving");
    setErrorMsg("");
    const result = await clientChangePassword(currentPassword, newPassword);
    if (result.ok) {
      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setStatus("idle"), 4000);
    } else {
      setStatus("error");
      // Surface Firebase Auth error codes when available for better UX
      const err = result.error;
      const code = (err as { code?: string })?.code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setErrorMsg(t("security.currentPassword") + " 錯誤");
      } else if (code === "auth/too-many-requests") {
        setErrorMsg("請求過於頻繁，請稍後再試");
      } else {
        setErrorMsg(err instanceof Error ? err.message : t("security.changeFailed"));
      }
    }
  };

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const tooShort = newPassword.length > 0 && newPassword.length < 8;

  return (
    <div className="mx-auto max-w-2xl space-y-8 duration-500 animate-in fade-in">
      <div className="flex items-center gap-3">
        <KeyRound className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("security.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("security.subtitle")}</p>
        </div>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">{t("security.changePassword")}</CardTitle>
          <CardDescription className="text-xs">{t("security.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-60">
              {t("security.currentPassword")}
            </Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-xl border-border/50"
              autoComplete="current-password"
            />
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-60">
              {t("security.newPassword")}
            </Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl border-border/50"
              autoComplete="new-password"
            />
            {tooShort && (
              <p className="text-xs text-destructive">{t("security.passwordTooShort")}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-60">
              {t("security.confirmPassword")}
            </Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl border-border/50"
              autoComplete="new-password"
            />
            {passwordMismatch && (
              <p className="text-xs text-destructive">{t("security.passwordMismatch")}</p>
            )}
          </div>

          {/* Feedback */}
          {status === "success" && (
            <p className="text-sm font-medium text-green-600">{t("security.passwordChanged")}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}

          {/* Save */}
          <div className="flex justify-end border-t border-border/40 pt-4">
            <Button
              onClick={handleChange}
              disabled={!isValid || status === "saving"}
              size="sm"
              className="gap-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <Save className="size-3.5" />
              {status === "saving" ? t("common.saving") : t("security.changePassword")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

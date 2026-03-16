"use client";
/**
 * ProfileCard — displays and edits the user's display name.
 *
 * Source: account.slice/domain.profile/_components/profile-card.tsx
 * Adapted: uses AccountProvider (useCurrentAccount) for shared auth/account state.
 */

import { User, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { clientUpdateProfile } from "@/modules/identity.module";
import { useCurrentAccount } from "./account-provider";
import { useTranslation } from "@/shared/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/primitives/ui/avatar";
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

export function ProfileCard() {
  const t = useTranslation("zh-TW");
  const { user, account } = useCurrentAccount();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync displayName from account (preferred) or Firebase Auth
  useEffect(() => {
    setDisplayName(account?.displayName ?? user?.displayName ?? "");
  }, [account?.displayName, user?.displayName]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const result = await clientUpdateProfile(displayName);
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const photoURL = account?.avatarUrl ?? user?.photoURL ?? null;
  const initial = (displayName || user?.email || "?")[0].toUpperCase();

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <User className="size-5 text-primary" />
          <div>
            <CardTitle className="text-base font-bold">{t("profile.title")}</CardTitle>
            <CardDescription className="text-xs">{t("profile.subtitle")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <Avatar className="size-16 rounded-2xl">
            {photoURL ? <AvatarImage src={photoURL} alt={displayName} /> : null}
            <AvatarFallback className="rounded-2xl bg-primary/10 text-xl font-bold text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{displayName || t("common.notSet")}</p>
            <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
          </div>
        </div>

        {/* Display name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="displayName"
            className="text-xs font-bold uppercase tracking-wider opacity-60"
          >
            {t("profile.displayName")}
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("profile.displayNamePlaceholder")}
            className="rounded-xl border-border/50"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider opacity-60">
            {t("profile.email")}
          </Label>
          <Input
            value={user?.email ?? ""}
            readOnly
            disabled
            className="rounded-xl border-border/50 opacity-60"
          />
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4">
          {saved && (
            <span className="text-xs font-medium text-green-600">
              {t("profile.saved")}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            size="sm"
            className="gap-2 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <Save className="size-3.5" />
            {saving ? t("common.saving") : t("profile.saveChanges")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

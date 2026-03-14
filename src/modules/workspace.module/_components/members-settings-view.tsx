"use client";
/**
 * MembersSettingsView — member list with real data.
 *
 * Source: workspace.slice/gov.members/_components/
 * Wave 26: wired to Firestore via useMembers(slug).
 * Shows loading spinner → member list (MemberRow) → empty state.
 */

import { Users, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { useTranslation } from "@/shared/i18n";
import { useMembers } from "./use-members";
import { MemberRow } from "./member-row";

interface MembersSettingsViewProps {
  slug: string;
}

export function MembersSettingsView({ slug }: MembersSettingsViewProps) {
  const t = useTranslation("zh-TW");
  const { members, loading } = useMembers(slug);

  return (
    <div className="mx-auto max-w-3xl space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("settings.members.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">@{slug}</p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-widest"
          disabled
        >
          <UserPlus className="size-4" />
          {t("settings.members.inviteMember")}
        </Button>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">
            {t("settings.members.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-7 animate-spin text-muted-foreground" />
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-2">
              {members.map((m) => (
                <MemberRow key={m.id} member={m} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-12 text-center">
              <Users className="mb-3 size-10 text-muted-foreground opacity-10" />
              <p className="font-bold">{t("settings.members.noMembers")}</p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-4 gap-2 text-xs font-bold uppercase tracking-wider"
                disabled
              >
                <UserPlus className="size-3.5" />
                {t("settings.members.inviteMember")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

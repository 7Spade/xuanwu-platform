"use client";
/**
 * MemberRow — displays a single membership record in the members settings table.
 *
 * Source equivalent: workspace.slice/gov.members/_components/member-row.tsx
 * Adapted: uses platform design-system badges + i18n.
 *
 * Shows accountId (shortened), role badge, status indicator, and invite date.
 */

import { User } from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import type { MemberDTO } from "@/modules/account.module";

interface MemberRowProps {
  member: MemberDTO;
}

function roleVariant(
  role: MemberDTO["role"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

function statusVariant(
  status: MemberDTO["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "secondary";
    case "pending":
      return "outline";
    case "revoked":
    case "suspended":
      return "destructive";
    default:
      return "outline";
  }
}

export function MemberRow({ member }: MemberRowProps) {
  const t = useTranslation("zh-TW");

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-sm">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-semibold leading-tight">
          {member.accountId.slice(0, 12)}…
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {t("settings.members.invited")}: {new Date(member.invitedAt).toLocaleDateString("zh-TW")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge
          variant={statusVariant(member.status)}
          className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider"
        >
          {t(`settings.members.status.${member.status}`)}
        </Badge>
        <Badge
          variant={roleVariant(member.role)}
          className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider"
        >
          {t(`settings.members.role.${member.role}`)}
        </Badge>
      </div>
    </div>
  );
}

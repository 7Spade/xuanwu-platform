"use client";
/**
 * AccountSwitcher — context switcher for personal account + organization accounts.
 *
 * Shows the current active account and allows switching between all available accounts.
 * For organization accounts, displays the user's role (owner/admin/member/viewer).
 * Personal account is always available at the top.
 */

import { Check, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/primitives/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/primitives/ui/dropdown-menu";
import { useTranslation } from "@/shared/i18n";
import type { MemberRole } from "@/modules/account.module";
import { useCurrentAccount, type AccountContextValue } from "./account-provider";

/** Capitalizes the first letter of a MemberRole for display. */
function capitalizeRole(role: MemberRole | null | undefined): string {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/** Formats the sub-label shown below the org name: "Role • handle" or just "Role". */
function orgSubLabel(role: MemberRole | null | undefined, handle: string | null): string {
  const parts: string[] = [];
  if (role) parts.push(capitalizeRole(role));
  if (handle) parts.push(handle);
  return parts.join(" • ");
}

interface AccountMenuItemProps {
  account: AccountContextValue["account"] | AccountContextValue["organizations"][number];
  isActive: boolean;
  userRole?: MemberRole | null;
  onClick: () => void;
}

function AccountMenuItem({ account, isActive, userRole, onClick }: AccountMenuItemProps) {
  if (!account) return null;
  const initial = (account.displayName || account.handle || "?")[0].toUpperCase();

  return (
    <DropdownMenuItem onClick={onClick} className="flex items-center gap-3 cursor-pointer">
      <Avatar className="size-8 rounded-lg">
        {account.avatarUrl ? <AvatarImage src={account.avatarUrl} alt={account.displayName} /> : null}
        <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{account.displayName}</p>
        <p className="text-[11px] text-muted-foreground">
          {account.accountType === "personal" ? (
            <span className="opacity-60">Personal</span>
          ) : (
            <span>{orgSubLabel(userRole, account.handle)}</span>
          )}
        </p>
      </div>
      {isActive && <Check className="size-4 text-primary shrink-0" />}
    </DropdownMenuItem>
  );
}

export function AccountSwitcher() {
  const t = useTranslation("zh-TW");
  const { account, activeAccount, organizations, orgRoles, setActiveAccount, activeAccountRole } = useCurrentAccount();

  if (!account) return null;

  const isPersonalActive = activeAccount === null || activeAccount?.id === account.id;
  const activeInitial = (activeAccount?.displayName || activeAccount?.handle || account.displayName || "?")[0].toUpperCase();
  const displayAccount = activeAccount || account;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 hover:bg-muted/40 transition-colors">
          <Avatar className="size-8 rounded-lg">
            {displayAccount.avatarUrl ? (
              <AvatarImage src={displayAccount.avatarUrl} alt={displayAccount.displayName} />
            ) : null}
            <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {activeInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate leading-tight">{displayAccount.displayName}</p>
            <p className="text-[10px] text-muted-foreground">
              {activeAccount?.accountType === "personal" || !activeAccount ? (
                <span className="opacity-60">Personal</span>
              ) : (
                <span>{capitalizeRole(activeAccountRole)}</span>
              )}
            </p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        {/* Personal account — always at top */}
        <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider opacity-60 px-2 py-1.5">
          {t("account.personalAccount")}
        </DropdownMenuLabel>
        <AccountMenuItem
          account={account}
          isActive={isPersonalActive}
          onClick={() => setActiveAccount(null)}
        />

        {/* Organizations */}
        {organizations.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider opacity-60 px-2 py-1.5">
              {t("account.organizations")}
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <AccountMenuItem
                key={org.id}
                account={org}
                isActive={activeAccount?.id === org.id}
                userRole={orgRoles[org.id]}
                onClick={() => setActiveAccount(org)}
              />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

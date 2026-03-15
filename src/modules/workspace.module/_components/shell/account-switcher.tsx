"use client";
/**
 * AccountSwitcher — top-left account context switcher in the dashboard sidebar.
 *
 * Displays the currently active account (personal or organization) and lets
 * the user switch between their personal account and any organizations they own.
 * Includes a link to create a new organization.
 */

import { Check, ChevronsUpDown, Globe, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCurrentAccount } from "@/modules/account.module/_components/account-provider";
import type { AccountDTO } from "@/modules/account.module/core/_use-cases";
import { useTranslation } from "@/shared/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/primitives/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/primitives/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/design-system/primitives/ui/sidebar";
import { cn } from "@/design-system/primitives/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitial(name?: string | null) {
  return (name ?? "?")[0].toUpperCase();
}

// ---------------------------------------------------------------------------
// AccountSwitcherItem
// ---------------------------------------------------------------------------

function AccountSwitcherItem({
  account,
  activeAccount,
  onSelect,
}: {
  account: AccountDTO;
  activeAccount: AccountDTO | null;
  onSelect: (account: AccountDTO) => void;
}) {
  const isPersonal = account.accountType === "personal";
  const avatarClass = isPersonal
    ? "bg-accent/10 text-accent border-accent/20"
    : "bg-primary/10 text-primary border-primary/20";

  const t = useTranslation("zh-TW");

  return (
    <DropdownMenuItem
      onSelect={() => onSelect(account)}
      className="flex cursor-pointer items-center justify-between rounded-lg py-2.5"
    >
      <div className="flex items-center gap-3">
        <Avatar className={cn("size-8 border", avatarClass)}>
          {account.avatarUrl ? (
            <AvatarImage src={account.avatarUrl} alt={account.displayName} />
          ) : null}
          <AvatarFallback className={cn("text-xs font-bold", avatarClass)}>
            {getInitial(account.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-xs font-bold">{account.displayName}</span>
          <span className="text-[10px] text-muted-foreground">
            {isPersonal ? t("sidebar.personal") : t("sidebar.organization")}
          </span>
        </div>
      </div>
      {activeAccount?.id === account.id && (
        <Check className="size-4 text-primary" />
      )}
    </DropdownMenuItem>
  );
}

// ---------------------------------------------------------------------------
// AccountSwitcher
// ---------------------------------------------------------------------------

export function AccountSwitcher() {
  const { isMobile } = useSidebar();
  const t = useTranslation("zh-TW");
  const { account, organizations, orgsLoading, activeAccount, setActiveAccount } =
    useCurrentAccount();

  const [open, setOpen] = useState(false);

  const allAccounts = useMemo<AccountDTO[]>(() => {
    if (!account) return [];
    return [account, ...organizations];
  }, [account, organizations]);

  const isLoading = orgsLoading && organizations.length === 0;
  const displayName = activeAccount?.displayName ?? t("sidebar.selectAccount");
  const isPersonal =
    !activeAccount || activeAccount.accountType === "personal";

  return (
    <>
      <Link
        href="/"
        className="mb-2 flex items-center px-1 transition-opacity hover:opacity-80"
      >
        <div className="select-none text-3xl" aria-label="Xuanwu">🐢</div>
      </Link>

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                suppressHydrationWarning
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeAccount ? (
                  <Avatar className="size-8 rounded-lg">
                    {activeAccount.avatarUrl ? (
                      <AvatarImage
                        src={activeAccount.avatarUrl}
                        alt={activeAccount.displayName}
                      />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        "rounded-lg text-xs font-bold",
                        isPersonal
                          ? "bg-accent/10 text-accent"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {getInitial(activeAccount.displayName)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Globe className="size-4" />
                  </div>
                )}

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {isLoading
                      ? t("sidebar.syncingAccounts")
                      : isPersonal
                        ? t("sidebar.personal")
                        : t("sidebar.organization")}
                  </span>
                </div>

                {isLoading ? (
                  <Loader2 className="ml-auto size-4 animate-spin" />
                ) : (
                  <ChevronsUpDown className="ml-auto size-4" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("sidebar.switchAccountContext")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {allAccounts.map((acc) => (
                <AccountSwitcherItem
                  key={acc.id}
                  account={acc}
                  activeAccount={activeAccount}
                  onSelect={(selected) => {
                    setActiveAccount(selected);
                    setOpen(false);
                  }}
                />
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                asChild
                className="flex cursor-pointer items-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary"
              >
                <Link href="/organizations">
                  <Plus className="size-4" />
                  {t("sidebar.createNewDimension")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}

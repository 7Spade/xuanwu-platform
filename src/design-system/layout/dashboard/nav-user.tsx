"use client";
/**
 * NavUser — Authenticated user menu in the sidebar footer.
 * Shows user avatar, name, and logout option.
 *
 * Aggregates from:
 * - account.module: useCurrentAccount() → user profile data
 * - identity.module: clientSignOut() → Firebase logout
 * - next/navigation: useRouter → post-logout navigation
 */

import { UserCircle, LogOut, ChevronsUpDown, Bell, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCurrentAccount } from "@/modules/account.module";
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
import { clientSignOut } from "@/modules/identity.module/_client-actions";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const t = useTranslation("zh-TW");
  const { user, account } = useCurrentAccount();

  const handleLogout = async () => {
    await clientSignOut();
    router.push("/login");
  };

  const displayName = account?.displayName ?? user?.displayName ?? user?.email ?? "";
  const email = user?.email ?? "";
  const photoURL = account?.avatarUrl ?? user?.photoURL ?? null;
  const initial = (displayName || email || "?")[0].toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                {photoURL ? (
                  <AvatarImage src={photoURL} alt={displayName} />
                ) : null}
                <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {displayName || t("common.loading")}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              {t("nav.account")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex cursor-pointer items-center gap-2 py-2"
              >
                <UserCircle className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {t("nav.profileSettings")}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="flex cursor-pointer items-center gap-2 py-2">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">{t("nav.notifications")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/organizations" className="flex cursor-pointer items-center gap-2 py-2">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">{t("nav.organizations")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/security" className="flex cursor-pointer items-center gap-2 py-2">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">{t("nav.security")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 py-2 text-destructive"
            >
              <LogOut className="size-4" />
              <span className="text-xs font-bold">{t("auth.signOut")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

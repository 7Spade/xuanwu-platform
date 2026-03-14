"use client";
/**
 * NavUser — Authenticated user menu in the sidebar footer.
 * Shows user avatar, name, and logout option.
 *
 * NOTE: This component uses Firebase Auth directly via onAuthStateChanged.
 * This is intentional for the initial shell bootstrap — a future AuthProvider
 * context (Application layer) should replace the direct infrastructure call once
 * the auth state management pattern is established across the platform.
 */

import { UserCircle, LogOut, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseApp } from "@/infrastructure/firebase/app";

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

function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(getFirebaseApp());
    return onAuthStateChanged(auth, setUser);
  }, []);

  return user;
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const t = useTranslation("zh-TW");
  const user = useCurrentUser();

  const handleLogout = async () => {
    await clientSignOut();
    router.push("/login");
  };

  const initial = user?.displayName?.[0] ?? user?.email?.[0] ?? "?";

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
                {user?.photoURL ? (
                  <AvatarImage
                    src={user.photoURL}
                    alt={user.displayName ?? ""}
                  />
                ) : null}
                <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
                  {initial.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.displayName ?? user?.email ?? t("common.loading")}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email ?? ""}
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

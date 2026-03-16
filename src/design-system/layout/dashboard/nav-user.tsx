"use client";
/**
 * NavUser — Pure UI component for user menu in sidebar footer.
 *
 * Props-based: accepts user data and action handlers.
 * For the orchestrated version with auth/account hooks, see:
 * src/modules/workspace.module/_components/shell/nav-user.tsx
 */

import { UserCircle, LogOut, ChevronsUpDown, Bell, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";

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

export interface NavUserProps {
  displayName: string;
  email: string;
  photoURL?: string | null;
  isMobile?: boolean;
  onLogout?: () => Promise<void>;
  labels?: {
    account?: string;
    profile?: string;
    notifications?: string;
    organizations?: string;
    settings?: string;
    logout?: string;
  };
}

export function NavUser({
  displayName,
  email,
  photoURL,
  isMobile: isStatic,
  onLogout,
  labels = {},
}: NavUserProps) {
  const { isMobile } = useSidebar();
  const mobile = isStatic ?? isMobile;
  const initial = (displayName || email || "?")[0].toUpperCase();

  const defaultLabels = {
    account: "Account",
    profile: "Profile Settings",
    notifications: "Notifications",
    organizations: "Organizations",
    settings: "Settings",
    logout: "Sign out",
    ...labels,
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

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
                  {displayName || "Loading…"}
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
            side={mobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              {defaultLabels.account}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex cursor-pointer items-center gap-2 py-2">
                <UserCircle className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {defaultLabels.profile}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="flex cursor-pointer items-center gap-2 py-2">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {defaultLabels.notifications}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/organizations" className="flex cursor-pointer items-center gap-2 py-2">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {defaultLabels.organizations}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex cursor-pointer items-center gap-2 py-2">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {defaultLabels.settings}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-2 py-2"
              >
                <LogOut className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {defaultLabels.logout}
                </span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

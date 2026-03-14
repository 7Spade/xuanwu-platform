"use client";
/**
 * LoginForm — Renders email + password fields and a submit button.
 */

import { Mail, Lock, Loader2 } from "lucide-react";

import { useTranslation } from "@/shared/i18n";
import { Button } from "@/design-system/primitives/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/design-system/primitives/ui/input-group";
import { Label } from "@/design-system/primitives/ui/label";

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleLogin: () => void;
  isLoading: boolean;
  onForgotPassword: () => void;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  isLoading,
  onForgotPassword,
}: LoginFormProps) {
  const t = useTranslation("zh-TW");

  return (
    <form
      className="flex flex-1 flex-col space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Label
            htmlFor="l-email"
            className="text-[11px] font-semibold tracking-tight text-muted-foreground/80"
          >
            {t("auth.contactEndpoint")}
          </Label>
        </div>
        <InputGroup className="h-11 rounded-xl border border-border/45 bg-background/70 ring-1 ring-border/25 transition-colors focus-within:border-primary/45 focus-within:ring-primary/35">
          <InputGroupAddon className="pl-4">
            <Mail className="size-4 text-muted-foreground/45" />
          </InputGroupAddon>
          <InputGroupInput
            id="l-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email")}
            className="font-medium"
            required
          />
        </InputGroup>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Label
            htmlFor="l-pass"
            className="text-[11px] font-semibold tracking-tight text-muted-foreground/80"
          >
            {t("auth.securityKey")}
          </Label>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onForgotPassword}
            className="h-auto p-0 text-[11px] font-semibold tracking-tight text-primary/70 transition-colors hover:bg-transparent hover:text-primary"
          >
            {t("auth.forgotPassword")}
          </Button>
        </div>
        <InputGroup className="h-11 rounded-xl border border-border/45 bg-background/70 ring-1 ring-border/25 transition-colors focus-within:border-primary/45 focus-within:ring-primary/35">
          <InputGroupAddon className="pl-4">
            <Lock className="size-4 text-muted-foreground/45" />
          </InputGroupAddon>
          <InputGroupInput
            id="l-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.password")}
            className="font-medium"
            required
          />
        </InputGroup>
      </div>

      <Button
        type="submit"
        className="mt-auto h-11 w-full rounded-xl bg-primary text-sm font-semibold tracking-tight text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 ease-out hover:brightness-105 active:scale-[0.985]"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          t("auth.enterDimension")
        )}
      </Button>
    </form>
  );
}

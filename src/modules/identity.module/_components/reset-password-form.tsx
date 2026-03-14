"use client";
/**
 * ResetPasswordForm — Email input and send/cancel buttons for password reset.
 */

import { useState } from "react";
import { Mail } from "lucide-react";

import { useTranslation } from "@/shared/i18n";
import { Button } from "@/design-system/primitives/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/design-system/primitives/ui/input-group";
import { Label } from "@/design-system/primitives/ui/label";
import { clientSendPasswordResetEmail } from "../_client-actions";

interface ResetPasswordFormProps {
  defaultEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ResetPasswordForm({
  defaultEmail = "",
  onSuccess,
  onCancel,
}: ResetPasswordFormProps) {
  const t = useTranslation("zh-TW");
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    const result = await clientSendPasswordResetEmail(email);
    setIsLoading(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="reset-email"
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
        >
          {t("auth.email")}
        </Label>
        <InputGroup className="h-12 rounded-2xl border-none bg-muted/20">
          <InputGroupAddon className="pl-4">
            <Mail className="size-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email")}
            className="font-medium"
            required
          />
        </InputGroup>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="rounded-xl px-6 text-xs font-black uppercase"
          disabled={isLoading}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSend}
          className="rounded-xl px-8 text-xs font-black uppercase shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {t("auth.sendEmail")}
        </Button>
      </div>
    </div>
  );
}

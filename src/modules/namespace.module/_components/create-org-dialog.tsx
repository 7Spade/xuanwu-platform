"use client";
/**
 * CreateOrgDialog — inline dialog for creating a new organization.
 *
 * DDD chain:
 *   Presentation (this dialog)
 *     → Application: createOrganizationAccount (account.module)
 *     → Application: registerNamespace         (namespace.module)
 *     → Infrastructure: FirestoreAccountRepository
 *     → Infrastructure: FirestoreNamespaceRepository + SlugAvailabilityAdapter
 *
 * On success the caller receives the newly created org AccountDTO so the
 * parent can optimistically update the organization list.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/design-system/primitives/ui/dialog";
import { Button } from "@/design-system/primitives/ui/button";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
import { useTranslation } from "@/shared/i18n";
import { useCurrentAccount } from "@/modules/account.module";
import type { AccountDTO } from "@/modules/account.module";
import { createOrganizationAccount } from "@/modules/account.module";
import { FirestoreAccountRepository } from "@/modules/account.module/infra.firestore/_repository";
import { registerNamespace } from "@/modules/namespace.module";
import { FirestoreNamespaceRepository } from "@/modules/namespace.module/infra.firestore/_repository";
import { FirestoreNamespaceSlugAvailabilityAdapter } from "@/modules/namespace.module/infra.firestore/_slug-availability";

// ---------------------------------------------------------------------------
// Lazy-init singletons (avoids re-creating on each render)
// ---------------------------------------------------------------------------

let _accountRepo: FirestoreAccountRepository | null = null;
function getAccountRepo() {
  if (!_accountRepo) _accountRepo = new FirestoreAccountRepository();
  return _accountRepo;
}

let _nsRepo: FirestoreNamespaceRepository | null = null;
function getNsRepo() {
  if (!_nsRepo) _nsRepo = new FirestoreNamespaceRepository();
  return _nsRepo;
}

let _slugPort: FirestoreNamespaceSlugAvailabilityAdapter | null = null;
function getSlugPort() {
  if (!_slugPort) _slugPort = new FirestoreNamespaceSlugAvailabilityAdapter();
  return _slugPort;
}

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------

const SLUG_REGEX = /^[a-z0-9-]{3,39}$/;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 39);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the newly created org AccountDTO so the parent can refresh. */
  onCreated: (org: AccountDTO) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateOrgDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOrgDialogProps) {
  const t = useTranslation("zh-TW");
  const { user } = useCurrentAccount();

  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleTouched, setHandleTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive a slug automatically from the name until the user edits it.
  const effectiveHandle = handleTouched ? handle : toSlug(displayName);

  const handleSlugInvalid = effectiveHandle.length > 0 && !SLUG_REGEX.test(effectiveHandle);

  const reset = () => {
    setDisplayName("");
    setHandle("");
    setHandleTouched(false);
    setError(null);
  };

  const canSubmit = displayName.trim().length > 0 && effectiveHandle.trim().length > 0 && !handleSlugInvalid;

  const handleCreate = async () => {
    if (!user || !canSubmit) return;
    const nameTrimmed = displayName.trim();
    const slugValue = effectiveHandle.trim();

    if (!nameTrimmed || !slugValue) return;
    if (!SLUG_REGEX.test(slugValue)) {
      setError(t("organizations.newOrg.slugInvalid"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create the org Account (Application use case — account.module)
      const orgId = crypto.randomUUID();
      const accountResult = await createOrganizationAccount(
        getAccountRepo(),
        orgId,
        user.uid,
        nameTrimmed,
      );
      if (!accountResult.ok) {
        setError(accountResult.error.message);
        return;
      }

      // 2. Register the namespace (Application use case — namespace.module).
      //    registerNamespace calls availabilityPort.isAvailable() internally
      //    and returns fail() if the slug is taken.
      //    ownerId == orgId (the namespace is owned by the org account, not the user).
      const nsResult = await registerNamespace(
        getNsRepo(),
        getSlugPort(),
        orgId,
        slugValue,
        "organization",
        orgId,
      );
      if (!nsResult.ok) {
        // Translate the generic slug-taken message to the user-facing i18n copy.
        const isTaken = nsResult.error.message.toLowerCase().includes("already taken");
        setError(isTaken ? t("organizations.newOrg.slugTaken") : nsResult.error.message);
        return;
      }

      reset();
      onOpenChange(false);
      onCreated(accountResult.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("organizations.newOrg.title")}</DialogTitle>
          <DialogDescription className="text-xs">
            {t("organizations.newOrg.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Display Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="org-name">{t("organizations.newOrg.name")}</Label>
            <Input
              id="org-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
              placeholder={t("organizations.newOrg.namePlaceholder")}
              disabled={loading}
              className="rounded-xl"
            />
          </div>

          {/* Handle / slug */}
          <div className="grid gap-1.5">
            <Label htmlFor="org-handle">{t("organizations.newOrg.handle")}</Label>
            <Input
              id="org-handle"
              value={effectiveHandle}
              onChange={(e) => {
                setHandle(e.target.value);
                setHandleTouched(true);
              }}
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
              placeholder={t("organizations.newOrg.handlePlaceholder")}
              disabled={loading}
              className="rounded-xl font-mono text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              {t("organizations.newOrg.handleHint")}
            </p>
            {handleSlugInvalid && (
              <p className="text-[10px] text-destructive">
                {t("organizations.newOrg.slugInvalid")}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { reset(); onOpenChange(false); }}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !canSubmit}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? t("common.creating") : t("common.confirmCreation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

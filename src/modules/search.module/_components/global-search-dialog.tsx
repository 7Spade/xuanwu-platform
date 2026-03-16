"use client";
/**
 * GlobalSearchDialog — Cmd+K command palette for cross-workspace search.
 *
 * Wave 47: global search UI backed by search.module executeSearch use-case.
 * Source: global-search.slice/core/_components/GlobalSearchDialog
 *
 * Architecture:
 *  - Uses the design-system Command primitive (cmdk under the hood).
 *  - Fires executeSearch via FirestoreSearchRepository on every keystroke.
 *  - Groups results by sourceModule.
 */

import { useCallback, useEffect, useState, useTransition } from "react";
import { File, Building2, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/design-system/primitives/ui/command";
import { useTranslation } from "@/shared/i18n";
import { executeSearch, type SearchResultDTO } from "@/modules/search.module";
import { useCurrentAccount } from "@/modules/account.module";

// ---------------------------------------------------------------------------
// Module icon helper
// ---------------------------------------------------------------------------

function ModuleIcon({ module: moduleName }: { module: string }) {
  if (moduleName === "workspace") return <Building2 className="size-4 shrink-0 text-muted-foreground" />;
  if (moduleName === "account") return <Users className="size-4 shrink-0 text-muted-foreground" />;
  return <File className="size-4 shrink-0 text-muted-foreground" />;
}

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const t = useTranslation("zh-TW");
  const { account } = useCurrentAccount();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultDTO[]>([]);
  const [, startTransition] = useTransition();

  // Fire search whenever query changes
  useEffect(() => {
    if (!query.trim() || !account?.id) {
      setResults([]);
      return;
    }
    const trimmed = query.trim();
    startTransition(() => {
      executeSearch(trimmed, account.id, "global", undefined, 20)
        .then((res) => {
          if (res.ok) setResults(res.value);
        })
        .catch(() => setResults([]));
    });
  }, [query, account?.id]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Group results by sourceModule
  const grouped = results.reduce<Record<string, SearchResultDTO[]>>((acc, r) => {
    if (!acc[r.sourceModule]) acc[r.sourceModule] = [];
    acc[r.sourceModule].push(r);
    return acc;
  }, {});

  const handleSelect = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <CommandDialog
      title={t("search.title")}
      description={t("search.placeholder")}
      open={open}
      onOpenChange={onOpenChange}
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder={t("search.placeholder")}
      />
      <CommandList>
        {!query.trim() && (
          <CommandEmpty>{t("search.hint")}</CommandEmpty>
        )}
        {query.trim() && results.length === 0 && (
          <CommandEmpty>{t("search.noResults")}</CommandEmpty>
        )}
        {Object.entries(grouped).map(([moduleName, items]) => (
          <CommandGroup
            key={moduleName}
            heading={t(`search.module.${moduleName}`) || moduleName}
          >
            {items.map((item) => (
              <CommandItem
                key={item.sourceId}
                onSelect={handleSelect}
                className="flex items-center gap-2"
              >
                <ModuleIcon module={moduleName} />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.snippet && (
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {item.snippet.slice(0, 48)}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

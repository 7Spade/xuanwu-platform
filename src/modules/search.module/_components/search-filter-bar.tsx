"use client";
/**
 * SearchFilterBar — scope + module-type filter chips for search results.
 *
 * Wave 61: advanced filter for `search.module`.
 *
 * Renders a horizontal row of chip buttons:
 *  - Scope: All | Global | Workspace
 *  - Module shortcuts derived from known module keys (workspace, account, work)
 *
 * Calls `onChange` with the selected scope / module.
 */

import { useTranslation } from "@/shared/i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SearchScopeFilter = "all" | "global" | "workspace";
export type SearchModuleFilter = string | null; // null = all modules

export interface SearchFilter {
  scope: SearchScopeFilter;
  module: SearchModuleFilter;
}

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

interface SearchFilterBarProps {
  filter: SearchFilter;
  availableModules: string[];
  onChange: (filter: SearchFilter) => void;
}

const SCOPE_OPTIONS: SearchScopeFilter[] = ["all", "global", "workspace"];

export function SearchFilterBar({
  filter,
  availableModules,
  onChange,
}: SearchFilterBarProps) {
  const t = useTranslation("zh-TW");

  function chipClass(active: boolean) {
    return [
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium cursor-pointer select-none",
      "transition-all duration-150 border",
      active
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground",
    ].join(" ");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Scope chips */}
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("search.filter.scope")}:
      </span>
      {SCOPE_OPTIONS.map((scope) => (
        <button
          key={scope}
          type="button"
          onClick={() => onChange({ ...filter, scope })}
          className={chipClass(filter.scope === scope)}
        >
          {t(`search.filter.${scope}`)}
        </button>
      ))}

      {/* Module chips (shown only when there are results) */}
      {availableModules.length > 0 && (
        <>
          <span className="mx-1 h-4 w-px bg-border" />
          <button
            type="button"
            onClick={() => onChange({ ...filter, module: null })}
            className={chipClass(filter.module === null)}
          >
            {t("search.filter.all")}
          </button>
          {availableModules.map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => onChange({ ...filter, module: mod })}
              className={chipClass(filter.module === mod)}
            >
              {t(`search.module.${mod}`) !== `search.module.${mod}`
                ? t(`search.module.${mod}`)
                : mod}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

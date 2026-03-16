"use client";
/**
 * SearchResultsView — standalone full-page search component.
 *
 * Wave 61: dedicated search results view for `search.module`.
 *
 * Features:
 *  - Live search triggered on every keystroke (debounced 300ms)
 *  - SearchFilterBar for scope and module filtering
 *  - localStorage-backed search history (useSearchHistory)
 *  - Results grouped by sourceModule with count badge
 *  - History panel shown when query is empty
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Clock, File, History, Search, Trash2, X } from "lucide-react";

import { Input } from "@/design-system/primitives/ui/input";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import { useCurrentAccount } from "@/modules/account.module";
import { FirestoreSearchQueryAdapter } from "@/modules/search.module/infra.firestore/_repository";
import { executeSearch } from "@/modules/search.module/core/_use-cases";
import type { SearchResultDTO } from "@/modules/search.module/core/_use-cases";
import { SearchFilterBar } from "./search-filter-bar";
import type { SearchFilter } from "./search-filter-bar";
import { useSearchHistory } from "./use-search-history";

// ---------------------------------------------------------------------------
// Singleton adapter
// ---------------------------------------------------------------------------

let _adapter: FirestoreSearchQueryAdapter | null = null;
function getAdapter() {
  if (!_adapter) _adapter = new FirestoreSearchQueryAdapter();
  return _adapter;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSize(n: number): string {
  return `${n} result${n !== 1 ? "s" : ""}`;
}

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

interface SearchResultsViewProps {
  /** Pre-fill query (e.g. from URL param). */
  initialQuery?: string;
}

export function SearchResultsView({ initialQuery = "" }: SearchResultsViewProps) {
  const t = useTranslation("zh-TW");
  const { account } = useCurrentAccount();
  const { history, push: pushHistory, clear: clearHistory } = useSearchHistory();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultDTO[]>([]);
  const [searching, setSearching] = useState(false);
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<SearchFilter>({
    scope: "all",
    module: null,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fire search on query / scope change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || !account?.id) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      const scope =
        filter.scope === "all" ? "global" : filter.scope;
      startTransition(() => {
        executeSearch(
          getAdapter(),
          query.trim(),
          account.id,
          scope,
          undefined,
          50,
        )
          .then((res) => {
            if (res.ok) setResults(res.value);
            setSearching(false);
          })
          .catch(() => {
            setResults([]);
            setSearching(false);
          });
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, filter.scope, account?.id]);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (q.trim()) pushHistory(q.trim());
    },
    [pushHistory],
  );

  // Apply module filter
  const filtered = useMemo(
    () =>
      filter.module
        ? results.filter((r) => r.sourceModule === filter.module)
        : results,
    [results, filter.module],
  );

  // Available modules from current result set
  const availableModules = useMemo(
    () => [...new Set(results.map((r) => r.sourceModule))].sort(),
    [results],
  );

  // Group filtered results by module
  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, SearchResultDTO[]>>((acc, r) => {
        if (!acc[r.sourceModule]) acc[r.sourceModule] = [];
        acc[r.sourceModule].push(r);
        return acc;
      }, {}),
    [filtered],
  );

  const showHistory = !query.trim() && history.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Search className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold tracking-tight">
            {t("search.results.title")}
          </h2>
          {!searching && query.trim() && (
            <Badge variant="secondary" className="ml-auto h-5 px-2 text-[10px]">
              {formatSize(filtered.length)}
            </Badge>
          )}
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t("search.placeholder")}
          className="h-10 rounded-xl pl-8 pr-8 text-sm"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Filter bar (shown when there are results) */}
      {results.length > 0 && (
        <SearchFilterBar
          filter={filter}
          availableModules={availableModules}
          onChange={setFilter}
        />
      )}

      {/* Search history panel */}
      {showHistory && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {t("search.history.title")}
            </span>
            <button
              type="button"
              onClick={clearHistory}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
              {t("search.history.clear")}
            </button>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card">
            {history.map((q, idx) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSearch(q)}
                className={[
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/40",
                  idx < history.length - 1 ? "border-b border-border/40" : "",
                ].join(" ")}
              >
                <Clock className="size-3.5 shrink-0 text-muted-foreground/60" />
                <span className="min-w-0 flex-1 truncate">{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty hint (when no query and no history) */}
      {!query.trim() && history.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Search className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t("search.hint")}</p>
        </div>
      )}

      {/* No results */}
      {query.trim() && !searching && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <File className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t("search.noResults")}</p>
        </div>
      )}

      {/* Searching skeleton */}
      {searching && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      )}

      {/* Results grouped by module */}
      {!searching &&
        Object.entries(grouped).map(([moduleName, items]) => (
          <div key={moduleName} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(`search.module.${moduleName}`) !== `search.module.${moduleName}`
                  ? t(`search.module.${moduleName}`)
                  : moduleName}
              </span>
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[10px] text-muted-foreground"
              >
                {items.length}
              </Badge>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card">
              {items.map((item, idx) => (
                <div
                  key={item.sourceId}
                  className={[
                    "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                    idx < items.length - 1 ? "border-b border-border/40" : "",
                  ].join(" ")}
                >
                  <File className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    {item.snippet && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                  {item.score > 0 && (
                    <span className="shrink-0 text-xs text-muted-foreground/60">
                      {(item.score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

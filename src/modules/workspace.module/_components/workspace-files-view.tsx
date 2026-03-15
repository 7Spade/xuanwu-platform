"use client";
/**
 * WorkspaceFilesView — workspace-scoped file browser.
 *
 * Wave 53: Dedicated /files capability tab for the "files" workspace capability.
 * Wraps file.module's useFiles hook with search, type-filter, and a clean grid.
 */

import { useMemo, useState } from "react";
import { FolderOpen, Search } from "lucide-react";

import { Input } from "@/design-system/primitives/ui/input";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import { useFiles } from "@/modules/file.module/_components/use-files";
import { FileItem } from "@/modules/file.module/_components/file-item";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WorkspaceFilesViewProps {
  workspaceId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkspaceFilesView({ workspaceId }: WorkspaceFilesViewProps) {
  const t = useTranslation("zh-TW");
  const { files, loading, error } = useFiles(workspaceId);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return files;
    const q = query.toLowerCase();
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.mimeType.toLowerCase().includes(q),
    );
  }, [files, query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold tracking-tight">
            {t("workspace.files.title")}
          </h2>
          {!loading && (
            <Badge variant="secondary" className="ml-auto h-5 px-2 text-[10px]">
              {files.length}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{t("workspace.files.description")}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("workspace.files.searchPlaceholder")}
          className="h-8 rounded-xl pl-8 text-sm"
        />
      </div>

      {/* File list */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-destructive">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <FolderOpen className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {query ? t("workspace.files.noResults") : t("workspace.files.empty")}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card">
          {filtered.map((file, idx) => (
            <div
              key={file.id}
              className={idx < filtered.length - 1 ? "border-b border-border/40" : ""}
            >
              <FileItem file={file} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

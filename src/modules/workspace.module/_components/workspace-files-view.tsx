"use client";
/**
 * WorkspaceFilesView — workspace-scoped file browser.
 *
 * Wave 53: Dedicated /files capability tab for the "files" workspace capability.
 * Wave 62: Added gallery mode toggle + file preview dialog + version badge.
 */

import { useMemo, useState } from "react";
import { FolderOpen, Grid2X2, List, Search } from "lucide-react";

import { Input } from "@/design-system/primitives/ui/input";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import {
  FileItem,
  FilePreview,
  getFileMimeGroup,
  useFiles,
  type FileDTO,
} from "@/modules/file.module";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WorkspaceFilesViewProps {
  workspaceId: string;
}

// ---------------------------------------------------------------------------
// Gallery card
// ---------------------------------------------------------------------------

const MIME_THUMB_BG: Record<string, string> = {
  image: "bg-purple-500/10",
  document: "bg-blue-500/10",
  code: "bg-green-500/10",
  data: "bg-amber-500/10",
  other: "bg-muted/30",
};

function GalleryCard({
  file,
  onClick,
}: {
  file: FileDTO;
  onClick: () => void;
}) {
  const group = getFileMimeGroup(file.mimeType);
  const bgClass = MIME_THUMB_BG[group] ?? "bg-muted/30";
  const isImage = group === "image" && file.downloadURL;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card text-left shadow-sm transition-all hover:border-border hover:shadow-md"
    >
      {/* Thumbnail */}
      <div
        className={`flex h-32 w-full items-center justify-center overflow-hidden ${bgClass}`}
      >
        {isImage ? (
          <img
            src={file.downloadURL}
            alt={file.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <span className="text-3xl font-bold text-muted-foreground/30 uppercase">
            {group.slice(0, 3)}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-muted-foreground">
            {group}
          </Badge>
          {file.versionCount > 1 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              v{file.versionCount}
            </Badge>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground">
            {new Date(file.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkspaceFilesView({ workspaceId }: WorkspaceFilesViewProps) {
  const t = useTranslation("zh-TW");
  const { files, loading, error } = useFiles(workspaceId);

  const [query, setQuery] = useState("");
  const [galleryMode, setGalleryMode] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileDTO | null>(null);

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
    <>
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
            {/* Gallery / List toggle */}
            <div className="flex items-center rounded-lg border border-border/50 bg-muted/20">
              <button
                type="button"
                aria-label={t("workspace.files.listMode")}
                aria-pressed={!galleryMode}
                onClick={() => setGalleryMode(false)}
                className={[
                  "rounded-l-lg px-2 py-1.5 transition-colors",
                  !galleryMode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <List className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={t("workspace.files.gallery")}
                aria-pressed={galleryMode}
                onClick={() => setGalleryMode(true)}
                className={[
                  "rounded-r-lg px-2 py-1.5 transition-colors",
                  galleryMode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Grid2X2 className="size-3.5" />
              </button>
            </div>
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

        {/* File content */}
        {loading ? (
          <div className={galleryMode ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "flex flex-col gap-2"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={galleryMode ? "h-48 animate-pulse rounded-2xl bg-muted/50" : "h-14 animate-pulse rounded-xl bg-muted/50"}
              />
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
        ) : galleryMode ? (
          /* Gallery grid */
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((file) => (
              <GalleryCard
                key={file.id}
                file={file}
                onClick={() => setPreviewFile(file)}
              />
            ))}
          </div>
        ) : (
          /* List view */
          <div className="rounded-2xl border border-border/50 bg-card">
            {filtered.map((file, idx) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setPreviewFile(file)}
                className={[
                  "w-full text-left transition-colors hover:bg-muted/30",
                  idx < filtered.length - 1 ? "border-b border-border/40" : "",
                ].join(" ")}
              >
                <FileItem file={file} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File preview overlay */}
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </>
  );
}

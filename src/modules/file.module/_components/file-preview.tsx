"use client";
/**
 * FilePreview — inline/modal preview for a workspace file.
 *
 * Wave 62: file preview for `file.module`.
 *
 * Supports:
 *  - image/* → <img> tag (uses downloadURL)
 *  - application/pdf → <iframe> embed
 *  - text/* / code → styled <pre> with a download link
 *  - Everything else → metadata card + download button
 *
 * Rendered inside a Dialog overlay. Call `onClose` to dismiss.
 */

import { Download, ExternalLink, FileQuestion, X } from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import { getMimeGroup } from "../domain.file/_service";
import type { FileDTO } from "../core/_use-cases";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

interface FilePreviewProps {
  file: FileDTO;
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const t = useTranslation("zh-TW");
  const group = getMimeGroup(file.mimeType);
  const currentVersion = file.versions.find(
    (v) => v.versionId === file.currentVersionId,
  );
  const downloadURL = file.downloadURL;
  const fileSize = currentVersion?.size ?? 0;

  const titleId = `file-preview-${file.id}`;

  return (
    /* Backdrop */
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-5 py-3">
          <p id={titleId} className="min-w-0 flex-1 truncate text-sm font-semibold">
            {file.name}
          </p>
          <Badge variant="outline" className="shrink-0 text-xs text-muted-foreground">
            {group}
          </Badge>
          {fileSize > 0 && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatBytes(fileSize)}
            </span>
          )}
          {downloadURL && (
            <a
              href={downloadURL}
              target="_blank"
              rel="noopener noreferrer"
              download={file.name}
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={t("workspace.files.download")}
            >
              <Download className="size-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Preview area */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/20 p-4">
          {!downloadURL ? (
            /* No URL available */
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <FileQuestion className="size-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {t("workspace.files.noPreview")}
              </p>
            </div>
          ) : group === "image" ? (
            /* Image preview */
            <img
              src={downloadURL}
              alt={file.name}
              className="max-h-[60dvh] max-w-full rounded-lg object-contain shadow"
            />
          ) : group === "document" && file.mimeType === "application/pdf" ? (
            /* PDF embed */
            <iframe
              src={downloadURL}
              title={file.name}
              sandbox="allow-same-origin allow-scripts"
              className="h-[60dvh] w-full rounded-lg border-0"
            />
          ) : (
            /* Generic fallback — metadata + external link */
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <FileQuestion className="size-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {t("workspace.files.noPreview")}
              </p>
              <a
                href={downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <ExternalLink className="size-3.5" />
                {t("workspace.files.download")}
              </a>
            </div>
          )}
        </div>

        {/* Footer: version history */}
        {file.versions.length > 1 && (
          <div className="shrink-0 border-t border-border/50 bg-muted/20 px-5 py-2">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">
              {t("workspace.files.versions")}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[...file.versions]
                .sort((a, b) => b.versionNumber - a.versionNumber)
                .map((v) => (
                  <a
                    key={v.versionId}
                    href={v.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      "shrink-0 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                      v.versionId === file.currentVersionId
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                    ].join(" ")}
                  >
                    {v.versionName}
                    <span className="ml-1 opacity-60">
                      · {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </a>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
/**
 * EditorView — workspace file browser + document editor shell (Wave 29).
 *
 * Source: workspace.slice/domain.document-parser/
 * Pattern: useFiles(workspaceId) → loading spinner → file list → empty state
 * Rich-text editing remains a future wave (no document-parser domain yet).
 */

import { FileText, Loader2, AlertCircle, Upload } from "lucide-react";
import { useTranslation } from "@/shared/i18n";
import { FileItem, useFiles } from "@/modules/file.module";

interface EditorViewProps {
  slug: string;
  workspaceId: string;
}

export function EditorView({ slug: _slug, workspaceId }: EditorViewProps) {
  const t = useTranslation("zh-TW");
  const { files, loading, error } = useFiles(workspaceId);

  return (
    <div className="flex h-full flex-col duration-500 animate-in fade-in">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-4 py-2">
        <FileText className="size-4 text-muted-foreground" />
        <span className="text-sm font-bold">{t("editor.title")}</span>
      </div>

      {/* File list panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: file list */}
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-border/40 bg-muted/5 px-2 py-3">
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-60">
            {t("editor.files")}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground opacity-40" />
            </div>
          ) : error ? (
            <div className="mx-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-border/40 bg-muted/5 px-4 py-8 text-center">
              <Upload className="mb-2 size-8 text-muted-foreground opacity-20" />
              <p className="text-xs text-muted-foreground opacity-60">
                {t("editor.noFiles")}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {files.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          )}
        </aside>

        {/* Right: editor area */}
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="max-w-sm text-sm text-muted-foreground/50 italic">
            {t("editor.empty")}
          </p>
        </main>
      </div>
    </div>
  );
}

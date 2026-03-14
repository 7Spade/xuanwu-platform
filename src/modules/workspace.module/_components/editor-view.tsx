"use client";
/**
 * EditorView — document editor shell.
 *
 * Source: workspace.slice/domain.document-parser/
 * Adapted: editor shell placeholder.
 */

import { FileText } from "lucide-react";
import { useTranslation } from "@/shared/i18n";

interface EditorViewProps {
  slug: string;
  workspaceId: string;
}

export function EditorView({ slug: _slug, workspaceId: _workspaceId }: EditorViewProps) {
  const t = useTranslation("zh-TW");

  return (
    <div className="flex h-full flex-col duration-500 animate-in fade-in">
      {/* Toolbar placeholder */}
      <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-4 py-2">
        <FileText className="size-4 text-muted-foreground" />
        <span className="text-sm font-bold">{t("editor.title")}</span>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="max-w-sm text-sm text-muted-foreground/50 italic">{t("editor.empty")}</p>
      </div>
    </div>
  );
}

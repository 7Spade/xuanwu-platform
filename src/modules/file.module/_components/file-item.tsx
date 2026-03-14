"use client";
/**
 * FileItem — renders a single file row in the EditorView file panel (Wave 29).
 *
 * Shows: file name, mime group badge, version count, creation date.
 */

import { FileText, Image, Code2, Database, FileQuestion } from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { getMimeGroup, type MimeGroup } from "../domain.file/_service";
import type { FileDTO } from "../core/_use-cases";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MIME_ICONS: Record<MimeGroup, React.ElementType> = {
  image: Image,
  document: FileText,
  code: Code2,
  data: Database,
  other: FileQuestion,
};

const MIME_BADGE_CLASS: Record<MimeGroup, string> = {
  image: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  document: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  code: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  data: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  other: "bg-muted/60 text-muted-foreground border-border/40",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FileItemProps {
  file: FileDTO;
}

export function FileItem({ file }: FileItemProps) {
  const group = getMimeGroup(file.mimeType);
  const Icon = MIME_ICONS[group];

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40">
      <Icon className="size-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {new Date(file.createdAt).toLocaleDateString()} · v{file.versionCount}
        </p>
      </div>

      <Badge variant="outline" className={`shrink-0 text-xs ${MIME_BADGE_CLASS[group]}`}>
        {group}
      </Badge>
    </div>
  );
}

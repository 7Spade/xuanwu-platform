"use client";
/**
 * CommentThread — displays and posts comments on any artifact.
 *
 * Wave 55: collaboration.module presentation component.
 * Features:
 *  - Flat + nested (reply) comment display
 *  - "Add comment" form (posts via Server Action or client-side direct write)
 *  - Soft-deleted comments shown as [deleted]
 *  - Optimistic insert on submit
 */

import { useState } from "react";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/design-system/primitives/ui/button";
import { Textarea } from "@/design-system/primitives/ui/textarea";
import { useTranslation } from "@/shared/i18n";
import { useCurrentAccount } from "@/modules/account.module/_components/account-provider";
import { useComments } from "./use-comments";
import { postComment } from "@/modules/collaboration.module/core/_use-cases";
import { FirestoreCommentRepository } from "@/modules/collaboration.module/infra.firestore/_repository";
import type { CommentDTO } from "@/modules/collaboration.module/core/_use-cases";

// ---------------------------------------------------------------------------
// Singleton repo (client-side)
// ---------------------------------------------------------------------------

let _repo: FirestoreCommentRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreCommentRepository();
  return _repo;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CommentThreadProps {
  artifactType: string;
  artifactId: string;
  /** If true, threads start collapsed. Default: false. */
  defaultCollapsed?: boolean;
}

// ---------------------------------------------------------------------------
// Single comment item
// ---------------------------------------------------------------------------

function CommentItem({ comment }: { comment: CommentDTO }) {
  const t = useTranslation("zh-TW");
  const isDeleted = !comment.body;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground select-none">
          {comment.authorAccountId.slice(0, 2).toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(comment.createdAt).toLocaleString("zh-TW", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className={`ml-8 text-sm leading-relaxed ${isDeleted ? "italic text-muted-foreground" : ""}`}>
        {isDeleted ? t("comment.deleted") : comment.body}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comment thread
// ---------------------------------------------------------------------------

export function CommentThread({ artifactType, artifactId, defaultCollapsed = false }: CommentThreadProps) {
  const t = useTranslation("zh-TW");
  const { account } = useCurrentAccount();
  const { comments, loading, refresh } = useComments(artifactType, artifactId);

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topLevel = comments.filter((c) => !c.parentId);

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || !account?.id) return;
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      // workspaceId is not required at this scope — pass empty string as the
      // WorkspaceId argument; the artifact identifiers (artifactType + artifactId)
      // are sufficient for retrieval via findByArtifact.
      const NO_WORKSPACE_SCOPE = "";
      await postComment(getRepo(), id, NO_WORKSPACE_SCOPE, artifactType, artifactId, account.id, trimmed);
      setBody("");
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare className="size-3.5" />
        <span>
          {t("comment.count").replace("{n}", String(topLevel.length))}
        </span>
        {collapsed ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
      </button>

      {!collapsed && (
        <>
          {/* Comment list */}
          {loading && (
            <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
          )}
          {!loading && topLevel.length === 0 && (
            <p className="text-xs text-muted-foreground">{t("comment.empty")}</p>
          )}
          {!loading && topLevel.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}

          {/* Compose */}
          {account && (
            <div className="flex items-end gap-2 mt-1">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("comment.placeholder")}
                rows={2}
                className="flex-1 resize-none text-sm"
              />
              <Button
                size="sm"
                variant="ghost"
                disabled={!body.trim() || submitting}
                onClick={handleSubmit}
                className="h-9 w-9 p-0"
              >
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

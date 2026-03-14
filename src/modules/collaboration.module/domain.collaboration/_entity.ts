import type { CommentId, ReactionType } from "./_value-objects";

/** A comment anchored to any artifact. */
export interface Comment {
  readonly id: CommentId;
  readonly workspaceId: string;
  readonly artifactType: string;
  readonly artifactId: string;
  readonly authorAccountId: string;
  readonly body: string;
  readonly parentId?: CommentId;
  readonly editedAt?: string;
  readonly deletedAt?: string;
  readonly createdAt: string;
}

export function buildComment(
  id: CommentId, workspaceId: string, artifactType: string, artifactId: string,
  authorAccountId: string, body: string, now: string, parentId?: CommentId,
): Comment {
  return { id, workspaceId, artifactType, artifactId, authorAccountId, body, parentId, createdAt: now };
}

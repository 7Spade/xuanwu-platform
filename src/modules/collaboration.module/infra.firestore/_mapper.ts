/**
 * Collaboration mapper — Firestore document ↔ Comment / Reaction transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { Comment } from "../domain.collaboration/_entity";
import type {
  CommentId,
  ReactionType,
} from "../domain.collaboration/_value-objects";
import type { Reaction } from "../domain.collaboration/_service";

// ---------------------------------------------------------------------------
// Firestore document shapes (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a Comment. */
export interface CommentDoc {
  id: string;
  workspaceId: string;
  artifactType: string;
  artifactId: string;
  authorAccountId: string;
  body: string;
  parentId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

/** Raw Firestore document shape for a Reaction sub-document / collection entry. */
export interface ReactionDoc {
  commentId: string;
  accountId: string;
  type: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

export function commentDocToEntity(doc: CommentDoc): Comment {
  return {
    id: doc.id as CommentId,
    workspaceId: doc.workspaceId,
    artifactType: doc.artifactType,
    artifactId: doc.artifactId,
    authorAccountId: doc.authorAccountId,
    body: doc.body,
    parentId: doc.parentId ? (doc.parentId as CommentId) : undefined,
    editedAt: doc.editedAt ?? undefined,
    deletedAt: doc.deletedAt ?? undefined,
    createdAt: doc.createdAt,
  };
}

export function commentEntityToDoc(comment: Comment): CommentDoc {
  return {
    id: comment.id,
    workspaceId: comment.workspaceId,
    artifactType: comment.artifactType,
    artifactId: comment.artifactId,
    authorAccountId: comment.authorAccountId,
    body: comment.body,
    parentId: comment.parentId ?? null,
    editedAt: comment.editedAt ?? null,
    deletedAt: comment.deletedAt ?? null,
    createdAt: comment.createdAt,
  };
}

export function reactionDocToVO(doc: ReactionDoc): Reaction {
  return {
    commentId: doc.commentId as CommentId,
    accountId: doc.accountId,
    type: doc.type as ReactionType,
    createdAt: doc.createdAt,
  };
}

export function reactionVOToDoc(reaction: Reaction): ReactionDoc {
  return {
    commentId: reaction.commentId,
    accountId: reaction.accountId,
    type: reaction.type,
    createdAt: reaction.createdAt,
  };
}

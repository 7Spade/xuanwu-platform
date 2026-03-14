/**
 * Collaboration domain service — pure business-rule functions for
 * Comment and Reaction management.
 *
 * All functions are stateless and side-effect-free.
 */

import type { Comment } from "./_entity";
import type { CommentId, ReactionType } from "./_value-objects";

// ---------------------------------------------------------------------------
// Mention extraction
// ---------------------------------------------------------------------------

/** RegExp that matches @handle mentions in comment bodies. */
export const MENTION_PATTERN = /@([a-zA-Z0-9_-]+)/g;

/**
 * Extracts unique @handle mentions from a comment body string.
 * Returns an empty array when no mentions are found.
 */
export function extractMentionedHandles(body: string): string[] {
  const matches = body.match(/@([a-zA-Z0-9_-]+)/g) ?? [];
  const handles = matches.map((m) => m.slice(1)); // strip leading '@'
  return [...new Set(handles)];
}

// ---------------------------------------------------------------------------
// Comment tree
// ---------------------------------------------------------------------------

/** A Comment node with its replies nested recursively. */
export interface CommentNode extends Comment {
  readonly replies: CommentNode[];
}

/**
 * Builds a nested reply tree from a flat list of comments.
 * Top-level comments (no `parentId`) become the root nodes; replies are
 * nested under their parent recursively.
 */
export function buildReplyTree(comments: Comment[]): CommentNode[] {
  const byId = new Map<CommentId, CommentNode>();
  for (const c of comments) {
    byId.set(c.id, { ...c, replies: [] });
  }
  const roots: CommentNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId) {
      const parent = byId.get(node.parentId);
      if (parent) {
        (parent.replies as CommentNode[]).push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// ---------------------------------------------------------------------------
// Comment guards
// ---------------------------------------------------------------------------

/** Returns `true` when `accountId` is the author and the comment is not deleted. */
export function isEditableByAuthor(
  comment: Comment,
  accountId: string,
): boolean {
  return comment.authorAccountId === accountId && !comment.deletedAt;
}

/** Returns `true` when the comment has been soft-deleted. */
export function isSoftDeleted(comment: Comment): boolean {
  return !!comment.deletedAt;
}

// ---------------------------------------------------------------------------
// Reaction helpers
// ---------------------------------------------------------------------------

/** Inline Reaction value object (not persisted as an entity — stored as sub-collection). */
export interface Reaction {
  readonly commentId: CommentId;
  readonly accountId: string;
  readonly type: ReactionType;
  readonly createdAt: string;
}

/**
 * Returns `true` when `accountId` has already added a reaction of `type` to
 * the given comment.
 */
export function hasReaction(
  reactions: Reaction[],
  type: ReactionType,
  accountId: string,
): boolean {
  return reactions.some((r) => r.type === type && r.accountId === accountId);
}

/**
 * Aggregates reactions into a count per type.
 * Returns an object with counts for all ReactionType values that appear.
 */
export function aggregateReactionCounts(
  reactions: Reaction[],
): Partial<Record<ReactionType, number>> {
  const counts: Partial<Record<ReactionType, number>> = {};
  for (const r of reactions) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
  }
  return counts;
}

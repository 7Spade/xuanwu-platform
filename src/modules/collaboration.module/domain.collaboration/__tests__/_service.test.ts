import { describe, it, expect } from "vitest";
import {
  extractMentionedHandles,
  buildReplyTree,
  isEditableByAuthor,
  isSoftDeleted,
  hasReaction,
  aggregateReactionCounts,
  type Reaction,
} from "../_service";
import type { Comment } from "../_entity";
import type { CommentId, ReactionType } from "../_value-objects";

function makeComment(id: string, authorAccountId = "acc-1", parentId?: string, deletedAt?: string): Comment {
  return {
    id: id as CommentId,
    workspaceId: "ws-1",
    artifactType: "task",
    artifactId: "task-1",
    authorAccountId,
    body: `Body of comment ${id}`,
    parentId: parentId as CommentId | undefined,
    deletedAt,
    createdAt: "2024-01-01T00:00:00Z",
  };
}

function makeReaction(commentId: string, accountId: string, type: ReactionType): Reaction {
  return { commentId: commentId as CommentId, accountId, type };
}

// ---------------------------------------------------------------------------
// extractMentionedHandles
// ---------------------------------------------------------------------------

describe("extractMentionedHandles", () => {
  it("extracts @-mentioned handles", () => {
    const handles = extractMentionedHandles("Hello @alice and @bob!");
    expect(handles).toContain("alice");
    expect(handles).toContain("bob");
  });

  it("deduplicates repeated mentions", () => {
    expect(extractMentionedHandles("@alice @alice")).toHaveLength(1);
  });

  it("returns empty array for no mentions", () => {
    expect(extractMentionedHandles("Hello world")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// buildReplyTree
// ---------------------------------------------------------------------------

describe("buildReplyTree", () => {
  it("builds a two-level reply tree", () => {
    const comments = [
      makeComment("c1"),
      makeComment("c2", "acc-2", "c1"),
    ];
    const tree = buildReplyTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.replies).toHaveLength(1);
    expect(tree[0]!.replies[0]!.id).toBe("c2");
  });

  it("returns all root comments", () => {
    const comments = [makeComment("c1"), makeComment("c2")];
    expect(buildReplyTree(comments)).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// isEditableByAuthor
// ---------------------------------------------------------------------------

describe("isEditableByAuthor", () => {
  it("returns true for the author on a non-deleted comment", () => {
    const comment = makeComment("c1", "acc-1");
    expect(isEditableByAuthor(comment, "acc-1")).toBe(true);
  });

  it("returns false for a different account", () => {
    const comment = makeComment("c1", "acc-1");
    expect(isEditableByAuthor(comment, "acc-2")).toBe(false);
  });

  it("returns false for a soft-deleted comment", () => {
    const comment = makeComment("c1", "acc-1", undefined, "2024-01-02T00:00:00Z");
    expect(isEditableByAuthor(comment, "acc-1")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isSoftDeleted
// ---------------------------------------------------------------------------

describe("isSoftDeleted", () => {
  it("returns true when deletedAt is set", () => {
    const comment = makeComment("c1", "acc-1", undefined, "2024-01-02T00:00:00Z");
    expect(isSoftDeleted(comment)).toBe(true);
  });

  it("returns false when deletedAt is absent", () => {
    expect(isSoftDeleted(makeComment("c1"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasReaction
// ---------------------------------------------------------------------------

describe("hasReaction", () => {
  it("returns true when reaction exists", () => {
    const reactions = [makeReaction("c1", "acc-1", "like")];
    expect(hasReaction(reactions, "like", "acc-1")).toBe(true);
  });

  it("returns false when reaction does not exist", () => {
    expect(hasReaction([], "like", "acc-1")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// aggregateReactionCounts
// ---------------------------------------------------------------------------

describe("aggregateReactionCounts", () => {
  it("counts reactions by type", () => {
    const reactions = [
      makeReaction("c1", "acc-1", "like"),
      makeReaction("c1", "acc-2", "like"),
      makeReaction("c1", "acc-3", "heart"),
    ];
    const counts = aggregateReactionCounts(reactions);
    expect(counts["like"]).toBe(2);
    expect(counts["heart"]).toBe(1);
  });

  it("returns empty object for no reactions", () => {
    expect(aggregateReactionCounts([])).toEqual({});
  });
});

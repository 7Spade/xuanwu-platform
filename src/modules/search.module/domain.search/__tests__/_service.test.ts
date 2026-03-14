import { describe, it, expect } from "vitest";
import {
  isVisibleTo,
  filterByVisibility,
  scoreRelevance,
  rankResults,
  tombstoneEntry,
  buildIndexEntry,
} from "../_service";
import type { SearchIndexEntry } from "../_entity";
import type { SearchIndexId } from "../_value-objects";

function makeEntry(
  id: string,
  title: string,
  snippet: string,
  ownerAccountId = "acc-1",
  visibility: SearchIndexEntry["visibility"] = "public",
  workspaceId?: string,
  tags: string[] = [],
): SearchIndexEntry {
  return {
    id: id as SearchIndexId,
    sourceModule: "work",
    sourceId: `src-${id}`,
    ownerAccountId,
    workspaceId,
    visibility,
    title,
    snippet,
    tags,
    indexedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// isVisibleTo
// ---------------------------------------------------------------------------

describe("isVisibleTo", () => {
  it("public entries are visible to everyone", () => {
    const entry = makeEntry("1", "Public", "snippet");
    expect(isVisibleTo(entry, "any-account")).toBe(true);
  });

  it("account-private is visible only to the owner", () => {
    const entry = makeEntry("1", "Private", "snippet", "acc-owner", "account-private");
    expect(isVisibleTo(entry, "acc-owner")).toBe(true);
    expect(isVisibleTo(entry, "acc-other")).toBe(false);
  });

  it("workspace-private is visible to owner or same workspace member", () => {
    const entry = makeEntry("1", "WS Private", "snippet", "acc-1", "workspace-private", "ws-1");
    expect(isVisibleTo(entry, "acc-2", "ws-1")).toBe(true);
    expect(isVisibleTo(entry, "acc-2", "ws-other")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// filterByVisibility
// ---------------------------------------------------------------------------

describe("filterByVisibility", () => {
  it("returns only visible entries", () => {
    const entries = [
      makeEntry("1", "Public", "s", "acc-1", "public"),
      makeEntry("2", "Private", "s", "acc-2", "account-private"),
    ];
    expect(filterByVisibility(entries, "acc-1")).toHaveLength(1);
    expect(filterByVisibility(entries, "acc-1")[0]!.id).toBe("1");
  });
});

// ---------------------------------------------------------------------------
// scoreRelevance
// ---------------------------------------------------------------------------

describe("scoreRelevance", () => {
  it("returns 0 for empty terms", () => {
    const entry = makeEntry("1", "Hello World", "Some snippet");
    expect(scoreRelevance(entry, [])).toBe(0);
  });

  it("scores title matches higher than snippet matches", () => {
    const entry = makeEntry("1", "TypeScript tutorial", "learn to code");
    const scoreTitle = scoreRelevance(entry, ["typescript"]);
    const scoreSnippet = scoreRelevance(entry, ["learn"]);
    expect(scoreTitle).toBeGreaterThan(scoreSnippet);
  });

  it("scores tag matches", () => {
    const entry = makeEntry("1", "Entry", "snippet", "acc-1", "public", undefined, ["typescript"]);
    expect(scoreRelevance(entry, ["typescript"])).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// rankResults
// ---------------------------------------------------------------------------

describe("rankResults", () => {
  it("returns results sorted by descending score", () => {
    const entries = [
      makeEntry("1", "TypeScript deep-dive", "advanced typescript patterns"),
      makeEntry("2", "JavaScript basics", "intro to js"),
      makeEntry("3", "TypeScript intro", "typescript for beginners"),
    ];
    const results = rankResults(entries, "typescript");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.score).toBeGreaterThanOrEqual(results[results.length - 1]!.score);
  });

  it("respects limit", () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry(`${i}`, `Title ${i}`, `snippet ${i}`),
    );
    expect(rankResults(entries, "title", 3)).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// tombstoneEntry
// ---------------------------------------------------------------------------

describe("tombstoneEntry", () => {
  it("replaces title and snippet with [deleted]", () => {
    const entry = makeEntry("1", "My File", "file contents");
    const tombstoned = tombstoneEntry(entry);
    expect(tombstoned.title).toBe("[deleted]");
    expect(tombstoned.snippet).toBe("[deleted]");
    expect(tombstoned.tags).toHaveLength(0);
  });

  it("preserves id and sourceModule", () => {
    const entry = makeEntry("1", "My File", "snippet");
    const tombstoned = tombstoneEntry(entry);
    expect(tombstoned.id).toBe("1");
    expect(tombstoned.sourceModule).toBe("work");
  });
});

// ---------------------------------------------------------------------------
// buildIndexEntry
// ---------------------------------------------------------------------------

describe("buildIndexEntry", () => {
  it("creates a SearchIndexEntry value object", () => {
    const entry = buildIndexEntry(
      "idx-1" as SearchIndexId,
      "task",
      "task-42",
      "My Task",
      "task description",
      "acc-1",
      "public",
      "2024-03-01T00:00:00Z",
    );
    expect(entry.id).toBe("idx-1");
    expect(entry.sourceModule).toBe("task");
    expect(entry.visibility).toBe("public");
  });
});

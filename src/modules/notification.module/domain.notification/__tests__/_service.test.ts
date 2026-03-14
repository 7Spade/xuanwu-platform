import { describe, it, expect } from "vitest";
import {
  NOTIFICATION_PRIORITY_ORDER,
  priorityIndex,
  sortByPriority,
  shouldDispatch,
  deduplicateNotifications,
} from "../_service";
import type { NotificationRecord } from "../_entity";
import type { NotificationPriority } from "../_value-objects";

function makeRecord(
  id: string,
  priority: NotificationPriority,
  sourceEventKey: string,
  recipientAccountId = "acc-1",
  createdAt = "2024-01-01T00:00:00Z",
): NotificationRecord {
  return {
    id,
    recipientAccountId,
    channel: "in-app",
    priority,
    title: "Test",
    body: "Body",
    sourceEventKey,
    read: false,
    createdAt,
  };
}

// ---------------------------------------------------------------------------
// priorityIndex
// ---------------------------------------------------------------------------

describe("priorityIndex", () => {
  it("urgent is index 0 (most urgent)", () => {
    expect(priorityIndex("urgent")).toBe(0);
  });

  it("low is last known index", () => {
    expect(priorityIndex("low")).toBe(NOTIFICATION_PRIORITY_ORDER.length - 1);
  });

  it("unknown priority is placed after low", () => {
    expect(priorityIndex("unknown" as NotificationPriority)).toBe(NOTIFICATION_PRIORITY_ORDER.length);
  });
});

// ---------------------------------------------------------------------------
// sortByPriority
// ---------------------------------------------------------------------------

describe("sortByPriority", () => {
  it("sorts from highest to lowest priority", () => {
    const records = [
      makeRecord("1", "low", "k1"),
      makeRecord("2", "urgent", "k2"),
      makeRecord("3", "normal", "k3"),
    ];
    const sorted = sortByPriority(records);
    expect(sorted[0]!.priority).toBe("urgent");
    expect(sorted[sorted.length - 1]!.priority).toBe("low");
  });

  it("does not mutate the original array", () => {
    const records = [makeRecord("1", "low", "k1"), makeRecord("2", "urgent", "k2")];
    const original = [...records];
    sortByPriority(records);
    expect(records[0]).toBe(original[0]);
  });
});

// ---------------------------------------------------------------------------
// shouldDispatch
// ---------------------------------------------------------------------------

describe("shouldDispatch", () => {
  it("returns true when no existing notifications", () => {
    const record = makeRecord("1", "normal", "evt-1");
    expect(shouldDispatch(record, [], 60_000)).toBe(true);
  });

  it("returns false when duplicate exists within window", () => {
    const now = new Date("2024-01-01T01:00:00Z").getTime();
    const existing = [makeRecord("0", "normal", "evt-1", "acc-1", new Date(now - 10_000).toISOString())];
    const record = makeRecord("1", "normal", "evt-1", "acc-1", new Date(now).toISOString());
    expect(shouldDispatch(record, existing, 60_000)).toBe(false);
  });

  it("returns true when duplicate is outside window", () => {
    const now = new Date("2024-01-01T01:00:00Z").getTime();
    const existing = [makeRecord("0", "normal", "evt-1", "acc-1", new Date(now - 120_000).toISOString())];
    const record = makeRecord("1", "normal", "evt-1", "acc-1", new Date(now).toISOString());
    expect(shouldDispatch(record, existing, 60_000)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deduplicateNotifications
// ---------------------------------------------------------------------------

describe("deduplicateNotifications", () => {
  it("passes unique notifications through", () => {
    const records = [
      makeRecord("1", "normal", "evt-1", "acc-1", "2024-01-01T00:00:00Z"),
      makeRecord("2", "normal", "evt-2", "acc-1", "2024-01-01T00:01:00Z"),
    ];
    expect(deduplicateNotifications(records, 60_000)).toHaveLength(2);
  });

  it("removes duplicates within the window", () => {
    const records = [
      makeRecord("1", "normal", "evt-1", "acc-1", "2024-01-01T00:00:00Z"),
      makeRecord("2", "normal", "evt-1", "acc-1", "2024-01-01T00:00:30Z"),
    ];
    expect(deduplicateNotifications(records, 60_000)).toHaveLength(1);
  });
});

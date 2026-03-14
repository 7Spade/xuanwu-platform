import { describe, it, expect } from "vitest";
import {
  getMimeGroup,
  getCurrentVersion,
  resolveCanonicalVersion,
  detectVersionConflict,
  buildFileVersion,
  canSubmitForParsing,
  isParseComplete,
} from "../_service";
import type { FileEntity, FileVersion } from "../_entity";
import type { FileId, FileVersionId } from "../_value-objects";

function makeVersion(id: string, versionNumber: number): FileVersion {
  return {
    versionId: id as FileVersionId,
    versionNumber,
    versionName: `v${versionNumber}`,
    size: 1024,
    uploadedBy: "acc-1",
    downloadURL: `https://example.com/${id}`,
    createdAt: "2024-01-01T00:00:00Z",
  };
}

function makeFile(
  currentVersionId: string,
  versions: FileVersion[],
  parseStatus: FileEntity["parseStatus"] = "pending",
): FileEntity {
  return {
    id: "file-1" as FileId,
    workspaceId: "ws-1",
    name: "report.pdf",
    mimeType: "application/pdf",
    currentVersionId: currentVersionId as FileVersionId,
    versions,
    parseStatus,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// getMimeGroup
// ---------------------------------------------------------------------------

describe("getMimeGroup", () => {
  it("classifies image/png as image", () => {
    expect(getMimeGroup("image/png")).toBe("image");
  });

  it("classifies application/pdf as document", () => {
    expect(getMimeGroup("application/pdf")).toBe("document");
  });

  it("classifies application/json as data", () => {
    expect(getMimeGroup("application/json")).toBe("data");
  });

  it("classifies text/javascript as code", () => {
    expect(getMimeGroup("text/javascript")).toBe("code");
  });

  it("classifies unknown types as other", () => {
    expect(getMimeGroup("application/octet-stream")).toBe("other");
  });

  it("classifies text/* as document", () => {
    expect(getMimeGroup("text/plain")).toBe("document");
  });
});

// ---------------------------------------------------------------------------
// getCurrentVersion
// ---------------------------------------------------------------------------

describe("getCurrentVersion", () => {
  it("returns the current version", () => {
    const v1 = makeVersion("v1", 1);
    const v2 = makeVersion("v2", 2);
    const file = makeFile("v2", [v1, v2]);
    expect(getCurrentVersion(file)?.versionId).toBe("v2");
  });

  it("returns undefined when no matching version", () => {
    const file = makeFile("missing", [makeVersion("v1", 1)]);
    expect(getCurrentVersion(file)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// resolveCanonicalVersion
// ---------------------------------------------------------------------------

describe("resolveCanonicalVersion", () => {
  it("returns the version with the highest version number", () => {
    const versions = [makeVersion("v1", 1), makeVersion("v3", 3), makeVersion("v2", 2)];
    expect(resolveCanonicalVersion(versions).versionId).toBe("v3");
  });

  it("throws for an empty versions array", () => {
    expect(() => resolveCanonicalVersion([])).toThrow();
  });
});

// ---------------------------------------------------------------------------
// detectVersionConflict
// ---------------------------------------------------------------------------

describe("detectVersionConflict", () => {
  it("returns false for two distinct versions with different version numbers", () => {
    const v1 = makeVersion("v1", 1);
    const v2 = makeVersion("v2", 2);
    expect(detectVersionConflict(v1, v2)).toBe(false);
  });

  it("returns true when two versions share the same versionNumber but differ in id", () => {
    const va = makeVersion("va", 2);
    const vb = makeVersion("vb", 2); // same versionNumber, different id = conflict
    expect(detectVersionConflict(va, vb)).toBe(true);
  });

  it("returns false when both version fields are identical", () => {
    const v1 = makeVersion("v1", 1);
    expect(detectVersionConflict(v1, v1)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildFileVersion
// ---------------------------------------------------------------------------

describe("buildFileVersion", () => {
  it("creates a FileVersion value object", () => {
    const v = buildFileVersion("vx", 4, "v4", 2048, "acc-1", "https://example.com/vx", "2024-03-01T00:00:00Z");
    expect(v.versionId).toBe("vx");
    expect(v.versionNumber).toBe(4);
    expect(v.size).toBe(2048);
  });
});

// ---------------------------------------------------------------------------
// canSubmitForParsing
// ---------------------------------------------------------------------------

describe("canSubmitForParsing", () => {
  it("returns true when parse status is pending and mimeType is supported", () => {
    const file = makeFile("v1", [makeVersion("v1", 1)], "pending");
    expect(canSubmitForParsing(file)).toBe(true);
  });

  it("returns false when parse is already in progress", () => {
    const file = makeFile("v1", [makeVersion("v1", 1)], "processing");
    expect(canSubmitForParsing(file)).toBe(false);
  });

  it("returns false when parse already succeeded", () => {
    const file = makeFile("v1", [makeVersion("v1", 1)], "success");
    expect(canSubmitForParsing(file)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isParseComplete
// ---------------------------------------------------------------------------

describe("isParseComplete", () => {
  it("returns true for success status", () => {
    const file = makeFile("v1", [makeVersion("v1", 1)], "success");
    expect(isParseComplete(file)).toBe(true);
  });

  it("returns false for pending status", () => {
    const file = makeFile("v1", [makeVersion("v1", 1)], "pending");
    expect(isParseComplete(file)).toBe(false);
  });
});

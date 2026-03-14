/**
 * File domain service — pure business-rule functions for FileEntity management.
 *
 * All functions are stateless and side-effect-free; they only compute results
 * from domain objects already loaded into memory.
 */

import type { FileEntity, FileVersion } from "./_entity";
import type { FileVersionId } from "./_value-objects";

// ---------------------------------------------------------------------------
// MIME type grouping
// ---------------------------------------------------------------------------

export type MimeGroup = "image" | "document" | "code" | "data" | "other";

/** Prefix → group mapping used by getMimeGroup. */
const MIME_PREFIX_MAP: Record<string, MimeGroup> = {
  "image/": "image",
  "video/": "image",
  "application/pdf": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml": "document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml": "data",
  "application/vnd.ms-excel": "data",
  "text/csv": "data",
  "application/json": "data",
  "text/javascript": "code",
  "text/typescript": "code",
  "application/javascript": "code",
  "text/html": "code",
  "text/xml": "code",
  "application/xml": "code",
};

/**
 * Classifies a MIME type into a coarse group suitable for UI icons and
 * processing-pipeline routing decisions.
 */
export function getMimeGroup(mimeType: string): MimeGroup {
  for (const [prefix, group] of Object.entries(MIME_PREFIX_MAP)) {
    if (mimeType.startsWith(prefix)) return group;
  }
  if (mimeType.startsWith("text/")) return "document";
  return "other";
}

// ---------------------------------------------------------------------------
// Version helpers
// ---------------------------------------------------------------------------

/**
 * Returns the FileVersion whose `versionId` matches `file.currentVersionId`,
 * or `undefined` if the list is somehow empty.
 */
export function getCurrentVersion(file: FileEntity): FileVersion | undefined {
  return file.versions.find((v) => v.versionId === file.currentVersionId);
}

/**
 * Returns the version with the highest `versionNumber` — used when the
 * `currentVersionId` pointer is out of sync after a concurrent write.
 */
export function resolveCanonicalVersion(
  versions: readonly FileVersion[],
): FileVersion {
  if (versions.length === 0) {
    throw new Error("resolveCanonicalVersion: versions array must not be empty");
  }
  return [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0]!;
}

/**
 * Returns `true` when `version` is no longer the current version of `file`.
 */
export function isVersionStale(
  version: FileVersion,
  file: FileEntity,
): boolean {
  return version.versionId !== file.currentVersionId;
}

/**
 * Detects a concurrent-upload collision: two versions have the same
 * `versionNumber` but different `versionId`s (a TOCTOU race).
 */
export function detectVersionConflict(
  a: FileVersion,
  b: FileVersion,
): boolean {
  return a.versionNumber === b.versionNumber && a.versionId !== b.versionId;
}

/**
 * Finds a version by its 1-based version number.  Returns `undefined` if not
 * found.
 */
export function getVersionByNumber(
  file: FileEntity,
  n: number,
): FileVersion | undefined {
  return file.versions.find((v) => v.versionNumber === n);
}

// ---------------------------------------------------------------------------
// Factory helper
// ---------------------------------------------------------------------------

/**
 * Builds a `FileVersion` value object.  All persistence concerns (storagePath,
 * downloadURL) are passed in from the infrastructure layer after the upload
 * has been committed to storage.
 */
export function buildFileVersion(
  id: FileVersionId,
  versionNumber: number,
  versionName: string,
  size: number,
  uploadedBy: string,
  downloadURL: string,
  now: string,
  storagePath?: string,
): FileVersion {
  return {
    versionId: id,
    versionNumber,
    versionName,
    size,
    uploadedBy,
    downloadURL,
    storagePath,
    createdAt: now,
  };
}

// ---------------------------------------------------------------------------
// Parse-status helpers
// ---------------------------------------------------------------------------

/** Returns `true` when the file has completed AI/document parsing. */
export function isParseComplete(file: FileEntity): boolean {
  return file.parseStatus === "success";
}

/** Returns `true` when a parse is actively in progress. */
export function isParseInProgress(file: FileEntity): boolean {
  return file.parseStatus === "processing";
}

/** Returns `true` when the file may be submitted for parsing. */
export function canSubmitForParsing(
  file: FileEntity,
  supportedGroups: readonly MimeGroup[] = ["document", "data"],
): boolean {
  return (
    file.parseStatus !== "processing" &&
    file.parseStatus !== "success" &&
    supportedGroups.includes(getMimeGroup(file.mimeType))
  );
}

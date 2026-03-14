import type { FileId, FileVersionId, ParseStatus } from "./_value-objects";

export interface FileVersion {
  readonly versionId: FileVersionId;
  readonly versionNumber: number;
  readonly versionName: string;
  readonly size: number;
  readonly uploadedBy: string;
  readonly downloadURL: string;
  readonly storagePath?: string;
  readonly createdAt: string; // ISO-8601
}

/**
 * File aggregate root.
 * Invariants:
 *   - A File always has at least one version (the initial upload).
 *   - The current version is always the latest uploaded version.
 *   - Versions are append-only; existing versions cannot be mutated.
 */
export interface FileEntity {
  readonly id: FileId;
  readonly workspaceId: string;
  readonly name: string;
  readonly mimeType: string;
  readonly currentVersionId: FileVersionId;
  readonly versions: readonly FileVersion[];
  readonly parseStatus: ParseStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function buildFileEntity(
  id: FileId,
  workspaceId: string,
  name: string,
  mimeType: string,
  initialVersion: FileVersion,
  now: string,
): FileEntity {
  return {
    id, workspaceId, name, mimeType,
    currentVersionId: initialVersion.versionId,
    versions: [initialVersion],
    parseStatus: "pending",
    createdAt: now, updatedAt: now,
  };
}

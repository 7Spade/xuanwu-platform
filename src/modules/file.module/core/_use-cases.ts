import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { FileEntity, FileVersion } from "../domain.file/_entity";
import { buildFileEntity } from "../domain.file/_entity";
import type { FileId, FileVersionId } from "../domain.file/_value-objects";
import type { IFileRepository } from "../domain.file/_ports";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface FileVersionDTO {
  readonly versionId: string;
  readonly versionNumber: number;
  readonly versionName: string;
  readonly size: number;
  readonly uploadedBy: string;
  readonly downloadURL: string;
  readonly createdAt: string;
}

export interface FileDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly mimeType: string;
  readonly currentVersionId: string;
  readonly versionCount: number;
  /** Download URL of the current version (empty string if unavailable). */
  readonly downloadURL: string;
  /** Full version history for this file. */
  readonly versions: readonly FileVersionDTO[];
  readonly createdAt: string;
}

function versionToDTO(v: FileVersion): FileVersionDTO {
  return {
    versionId: v.versionId,
    versionNumber: v.versionNumber,
    versionName: v.versionName,
    size: v.size,
    uploadedBy: v.uploadedBy,
    downloadURL: v.downloadURL,
    createdAt: v.createdAt,
  };
}

function entityToDTO(f: FileEntity): FileDTO {
  const currentVersion = f.versions.find(
    (v) => v.versionId === f.currentVersionId,
  );
  return {
    id: f.id,
    workspaceId: f.workspaceId,
    name: f.name,
    mimeType: f.mimeType,
    currentVersionId: f.currentVersionId,
    versionCount: f.versions.length,
    downloadURL: currentVersion?.downloadURL ?? "",
    versions: f.versions.map(versionToDTO),
    createdAt: f.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Use cases
// ---------------------------------------------------------------------------

export async function uploadFile(
  repo: IFileRepository,
  id: string,
  workspaceId: string,
  name: string,
  mimeType: string,
  versionId: string,
  downloadURL: string,
  uploadedBy: string,
  size: number,
): Promise<Result<FileDTO>> {
  try {
    const now = new Date().toISOString();
    const version: FileVersion = {
      versionId: versionId as FileVersionId,
      versionNumber: 1,
      versionName: "v1",
      size, uploadedBy, downloadURL, createdAt: now,
    };
    const file = buildFileEntity(id as FileId, workspaceId, name, mimeType, version, now);
    await repo.save(file);
    return ok(entityToDTO(file));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getFilesByWorkspace(
  repo: IFileRepository,
  workspaceId: string,
): Promise<Result<FileDTO[]>> {
  try {
    const files = await repo.findByWorkspaceId(workspaceId);
    return ok(files.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

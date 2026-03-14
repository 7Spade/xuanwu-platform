import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { FileEntity, FileVersion } from "../domain.file/_entity";
import { buildFileEntity } from "../domain.file/_entity";
import type { FileId, FileVersionId } from "../domain.file/_value-objects";
import type { IFileRepository } from "../domain.file/_ports";

export interface FileDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly mimeType: string;
  readonly currentVersionId: string;
  readonly versionCount: number;
  readonly createdAt: string;
}

function entityToDTO(f: FileEntity): FileDTO {
  return {
    id: f.id, workspaceId: f.workspaceId, name: f.name,
    mimeType: f.mimeType, currentVersionId: f.currentVersionId,
    versionCount: f.versions.length, createdAt: f.createdAt,
  };
}

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

/**
 * File mapper — Firestore document ↔ FileEntity / FileVersion transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { FileEntity, FileVersion } from "../domain.file/_entity";
import type {
  FileId,
  FileVersionId,
  ParseStatus,
} from "../domain.file/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shapes (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a FileVersion sub-document. */
export interface FileVersionDoc {
  versionId: string;
  versionNumber: number;
  versionName: string;
  size: number;
  uploadedBy: string;
  downloadURL: string;
  storagePath: string | null;
  createdAt: string;
}

/** Raw Firestore document shape for a FileEntity. */
export interface FileEntityDoc {
  id: string;
  workspaceId: string;
  name: string;
  mimeType: string;
  currentVersionId: string;
  versions: FileVersionDoc[];
  parseStatus: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

export function fileVersionDocToVO(doc: FileVersionDoc): FileVersion {
  return {
    versionId: doc.versionId as FileVersionId,
    versionNumber: doc.versionNumber,
    versionName: doc.versionName,
    size: doc.size,
    uploadedBy: doc.uploadedBy,
    downloadURL: doc.downloadURL,
    storagePath: doc.storagePath ?? undefined,
    createdAt: doc.createdAt,
  };
}

export function fileVersionToDoc(version: FileVersion): FileVersionDoc {
  return {
    versionId: version.versionId,
    versionNumber: version.versionNumber,
    versionName: version.versionName,
    size: version.size,
    uploadedBy: version.uploadedBy,
    downloadURL: version.downloadURL,
    storagePath: version.storagePath ?? null,
    createdAt: version.createdAt,
  };
}

export function fileEntityDocToEntity(doc: FileEntityDoc): FileEntity {
  return {
    id: doc.id as FileId,
    workspaceId: doc.workspaceId,
    name: doc.name,
    mimeType: doc.mimeType,
    currentVersionId: doc.currentVersionId as FileVersionId,
    versions: doc.versions.map(fileVersionDocToVO),
    parseStatus: doc.parseStatus as ParseStatus,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function fileEntityToDoc(entity: FileEntity): FileEntityDoc {
  return {
    id: entity.id,
    workspaceId: entity.workspaceId,
    name: entity.name,
    mimeType: entity.mimeType,
    currentVersionId: entity.currentVersionId,
    versions: entity.versions.map(fileVersionToDoc),
    parseStatus: entity.parseStatus,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

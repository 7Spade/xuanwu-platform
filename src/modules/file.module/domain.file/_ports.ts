import type { FileEntity } from "./_entity";
import type { FileId } from "./_value-objects";
import type {
  ParsingIntent,
  ParsingIntentId,
  ParsingImport,
  ParsingImportStatus,
} from "./_parsing-intent";

export interface IFileRepository {
  findById(id: FileId): Promise<FileEntity | null>;
  findByWorkspaceId(workspaceId: string): Promise<FileEntity[]>;
  save(file: FileEntity): Promise<void>;
  deleteById(id: FileId): Promise<void>;
  updateParseStatus(id: FileId, status: FileEntity["parseStatus"]): Promise<void>;
}

export interface IStoragePort {
  getDownloadURL(storagePath: string): Promise<string>;
  deleteFile(storagePath: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Document Intelligence ports
// ---------------------------------------------------------------------------

/**
 * Repository for ParsingIntent aggregates.
 * Stored at:  workspaces/{workspaceId}/parsingIntents/{intentId}
 */
export interface IParsingIntentRepository {
  /** Persists a new ParsingIntent document. Returns the generated Firestore ID. */
  create(workspaceId: string, intent: Omit<ParsingIntent, "id">): Promise<string>;
  findById(workspaceId: string, id: ParsingIntentId): Promise<ParsingIntent | null>;
  /** Returns the latest non-superseded intent for a given source file. */
  findBySourceFileId(workspaceId: string, sourceFileId: string): Promise<ParsingIntent | null>;
  updateStatus(workspaceId: string, id: ParsingIntentId, status: ParsingIntent["status"]): Promise<void>;
  /** Marks oldId as superseded and records newId as its successor. */
  supersede(workspaceId: string, oldId: ParsingIntentId, newId: ParsingIntentId): Promise<void>;
  /** Real-time subscription — returns an unsubscribe function. */
  subscribe(
    workspaceId: string,
    onUpdate: (intents: ParsingIntent[]) => void,
  ): () => void;
}

/**
 * Repository for ParsingImport execution ledger entries.
 * Stored at:  workspaces/{workspaceId}/parsingImports/{idempotencyKey}
 */
export interface IParsingImportRepository {
  create(workspaceId: string, entry: Omit<ParsingImport, "id">): Promise<string>;
  findByIdempotencyKey(workspaceId: string, key: string): Promise<ParsingImport | null>;
  updateStatus(
    workspaceId: string,
    importId: string,
    update: {
      status: ParsingImportStatus;
      appliedWorkItemIds: string[];
      error?: { code: string; message: string };
    },
  ): Promise<void>;
}

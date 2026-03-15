import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { FileEntity, FileVersion } from "../domain.file/_entity";
import { buildFileEntity } from "../domain.file/_entity";
import type { FileId, FileVersionId } from "../domain.file/_value-objects";
import type { IFileRepository, IParsingIntentRepository, IParsingImportRepository } from "../domain.file/_ports";
import type {
  ParsingIntent,
  ParsingIntentId,
  ParsedLineItem,
  ParsingIntentSourceType,
  ParsingIntentReviewStatus,
  SourcePointer,
} from "../domain.file/_parsing-intent";

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
  readonly parseStatus: string;
  readonly createdAt: string;
}

export interface ParsedLineItemDTO {
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly discount: number;
  readonly subtotal: number;
  readonly semanticTagSlug: string;
  readonly sourceIntentIndex: number;
}

export interface ParsingIntentDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly sourceFileName: string;
  readonly sourceFileId?: string;
  readonly sourceFileVersionId?: string;
  readonly intentVersion: number;
  readonly lineItems: readonly ParsedLineItemDTO[];
  readonly semanticHash?: string;
  readonly sourceType: string;
  readonly reviewStatus: string;
  readonly status: string;
  readonly createdAt: string;
  readonly importedAt?: string;
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
    parseStatus: f.parseStatus,
    createdAt: f.createdAt,
  };
}

function lineItemToDTO(item: ParsedLineItem): ParsedLineItemDTO {
  return {
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount ?? 0,
    subtotal: item.subtotal,
    semanticTagSlug: item.semanticTagSlug,
    sourceIntentIndex: item.sourceIntentIndex,
  };
}

function intentToDTO(intent: ParsingIntent): ParsingIntentDTO {
  return {
    id: intent.id,
    workspaceId: intent.workspaceId,
    sourceFileName: intent.sourceFileName,
    sourceFileId: intent.sourceFileId,
    sourceFileVersionId: intent.sourceFileVersionId,
    intentVersion: intent.intentVersion,
    lineItems: intent.lineItems.map(lineItemToDTO),
    semanticHash: intent.semanticHash,
    sourceType: intent.sourceType,
    reviewStatus: intent.reviewStatus,
    status: intent.status,
    createdAt: intent.createdAt,
    importedAt: intent.importedAt,
  };
}

/**
 * Computes a stable SHA-256 hex digest from a ParsedLineItem array.
 * Used to detect duplicate parses (same content → same hash → no duplicate intent).
 * Normalization: undefined/optional fields are omitted for canonical representation.
 */
async function computeSemanticHash(lineItems: ParsedLineItem[]): Promise<string> {
  const canonical = lineItems
    .map((item) => {
      const entry: Record<string, unknown> = {
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        semanticTagSlug: item.semanticTagSlug,
        sourceIntentIndex: item.sourceIntentIndex,
      };
      // Only include discount if explicitly set (avoid undefined vs omitted hash drift)
      if (item.discount !== undefined) entry["discount"] = item.discount;
      return entry;
    })
    .sort((a, b) => (a["sourceIntentIndex"] as number) - (b["sourceIntentIndex"] as number));

  const payload = JSON.stringify(canonical);
  const encoded = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Builds a canonical idempotency key for a ParsingImport record. */
export function buildParsingImportIdempotencyKey(
  intentId: string,
  intentVersion: number,
): string {
  return `import:${intentId}:${intentVersion}`;
}

// ---------------------------------------------------------------------------
// File use cases
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

// ---------------------------------------------------------------------------
// Document Intelligence use cases
// ---------------------------------------------------------------------------

/**
 * Marks a file as "processing" to indicate Document AI OCR has been triggered.
 * Called after the caller POSTs to the processDocument Cloud Function endpoint.
 */
export async function markFileAsProcessing(
  repo: IFileRepository,
  fileId: string,
): Promise<Result<void>> {
  try {
    await repo.updateParseStatus(fileId as FileId, "processing");
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export type SaveParsingIntentInput = {
  workspaceId: string;
  sourceFileName: string;
  lineItems: ParsedLineItem[];
  sourceFileId?: string;
  sourceFileVersionId?: string;
  sourceFileStoragePath?: string;
  sourceFileDownloadURL?: string;
  parserVersion?: string;
  modelVersion?: string;
  sourceType?: ParsingIntentSourceType;
  reviewStatus?: ParsingIntentReviewStatus;
  previousIntentId?: ParsingIntentId;
};

export type SaveParsingIntentResult = {
  intentId: string;
  /** Set when a previous intent was superseded. */
  oldIntentId?: string;
  /** True when an existing intent with identical semanticHash was reused. */
  isDuplicate: boolean;
};

/**
 * Saves a ParsingIntent (Digital Twin) for a completed document parse.
 *
 * Deduplication logic:
 *   1. If a non-superseded intent exists for sourceFileId AND has the same
 *      semanticHash → return the existing intent without writing (true duplicate).
 *   2. If it has a different hash → supersede the old intent and create a new one.
 *   3. If no previous intent exists → create a fresh intent.
 */
export async function saveParsingIntent(
  intentRepo: IParsingIntentRepository,
  input: SaveParsingIntentInput,
): Promise<Result<SaveParsingIntentResult>> {
  try {
    const semanticHash = await computeSemanticHash(input.lineItems);
    let previousIntentId = input.previousIntentId;

    if (input.sourceFileId) {
      const existing = await intentRepo.findBySourceFileId(
        input.workspaceId,
        input.sourceFileId,
      );
      if (existing) {
        // Only treat as duplicate when existing has a hash AND it matches.
        // An undefined hash (legacy record) forces a new intent with a proper hash.
        if (existing.semanticHash !== undefined && existing.semanticHash === semanticHash) {
          return ok({ intentId: existing.id, isDuplicate: true });
        }
        previousIntentId = existing.id as ParsingIntentId;
      }
    }

    const now = new Date().toISOString();
    const intentId = await intentRepo.create(input.workspaceId, {
      workspaceId: input.workspaceId,
      sourceFileName: input.sourceFileName,
      lineItems: input.lineItems,
      sourceFileId: input.sourceFileId,
      sourceFileVersionId: input.sourceFileVersionId,
      sourceFileStoragePath: input.sourceFileStoragePath,
      sourceFileDownloadURL: input.sourceFileDownloadURL as
        | SourcePointer
        | undefined,
      intentVersion: 1,
      semanticHash,
      parserVersion: input.parserVersion,
      modelVersion: input.modelVersion,
      sourceType: input.sourceType ?? "ai",
      reviewStatus: input.reviewStatus ?? "pending_review",
      status: "pending",
      createdAt: now,
    });

    if (previousIntentId) {
      await intentRepo.supersede(
        input.workspaceId,
        previousIntentId,
        intentId as ParsingIntentId,
      );
      return ok({ intentId, oldIntentId: previousIntentId, isDuplicate: false });
    }

    return ok({ intentId, isDuplicate: false });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Retrieves all ParsingIntents for a workspace ordered by createdAt desc.
 */
export async function getParsingIntentsByWorkspace(
  intentRepo: IParsingIntentRepository,
  workspaceId: string,
): Promise<Result<ParsingIntentDTO[]>> {
  try {
    const intents: ParsingIntent[] = [];
    await new Promise<void>((resolve) => {
      let settled = false;
      const settle = () => {
        if (!settled) { settled = true; resolve(); }
      };
      const unsub = intentRepo.subscribe(workspaceId, (items) => {
        intents.push(...items);
        unsub();
        settle();
      });
      // Timeout fallback in case Firestore takes too long
      setTimeout(() => { unsub(); settle(); }, 5000);
    });
    return ok(intents.map(intentToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export type StartImportResult = {
  importId: string;
  idempotencyKey: string;
  isDuplicate: boolean;
};

/**
 * Opens a ParsingImport ledger entry and marks the intent as "importing".
 * Idempotent: returns the existing import record if the key already exists.
 */
export async function startParsingImport(
  intentRepo: IParsingIntentRepository,
  importRepo: IParsingImportRepository,
  workspaceId: string,
  intentId: string,
  intentVersion = 1,
): Promise<Result<StartImportResult>> {
  try {
    const idempotencyKey = buildParsingImportIdempotencyKey(intentId, intentVersion);
    const existing = await importRepo.findByIdempotencyKey(workspaceId, idempotencyKey);
    if (existing) {
      return ok({ importId: existing.id, idempotencyKey, isDuplicate: true });
    }

    const now = new Date().toISOString();
    const importId = await importRepo.create(workspaceId, {
      workspaceId,
      intentId: intentId as ParsingIntentId,
      intentVersion,
      idempotencyKey,
      status: "started",
      appliedWorkItemIds: [],
      startedAt: now,
    });

    await intentRepo.updateStatus(workspaceId, intentId as ParsingIntentId, "importing");

    return ok({ importId, idempotencyKey, isDuplicate: false });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Closes a ParsingImport ledger entry and updates the intent status accordingly.
 */
export async function finishParsingImport(
  intentRepo: IParsingIntentRepository,
  importRepo: IParsingImportRepository,
  workspaceId: string,
  importId: string,
  intentId: string,
  appliedWorkItemIds: string[],
  error?: { code: string; message: string },
): Promise<Result<void>> {
  try {
    const status = error
      ? appliedWorkItemIds.length > 0 ? "partial" : "failed"
      : "applied";

    await importRepo.updateStatus(workspaceId, importId, {
      status,
      appliedWorkItemIds,
      error,
    });

    const intentStatus = status === "applied" || status === "partial"
      ? "imported"
      : "failed";
    await intentRepo.updateStatus(workspaceId, intentId as ParsingIntentId, intentStatus);

    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

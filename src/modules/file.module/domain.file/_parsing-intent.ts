/**
 * file.module — Document Intelligence domain types.
 *
 * Defines the three aggregate / value-object types that model the document
 * parsing lifecycle within the File bounded context:
 *
 *   ParsedLineItem   — a single semantically-enriched extracted line item
 *   ParsingIntent    — Digital Twin of one parsing run (aggregate root)
 *   ParsingImport    — Execution ledger for one intent materialization attempt
 *
 * Status state-machines
 * ─────────────────────
 *  ParsingIntentStatus:
 *    pending → importing → imported (all task writes done)
 *              importing → failed   (materialization error)
 *    any non-terminal → superseded  (newer intent replaces it)
 *
 *  ParsingImportStatus:
 *    started → applied  (all task writes done)
 *    started → partial  (some writes succeeded)
 *    started → failed   (materialization failed)
 */

// ---------------------------------------------------------------------------
// Branded ID types — nominal safety for cross-domain references
// ---------------------------------------------------------------------------

/** Branded ID for a ParsingIntent document — prevents mixing with plain string IDs. */
export type ParsingIntentId = string & { readonly _brand: "ParsingIntentId" };

/** Branded pointer to a source file download URL — immutable contract anchor. */
export type SourcePointer = string & { readonly _brand: "SourcePointer" };

// ---------------------------------------------------------------------------
// ParsedLineItem
// ---------------------------------------------------------------------------

/**
 * A single extracted line item from a parsed document.
 * Produced by the Phase 2 Genkit AI flow and stored inside a ParsingIntent.
 */
export interface ParsedLineItem {
  /** Item description (料號/品名). */
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  /** Final total after discount (小計). */
  subtotal: number;
  /**
   * Slug-like semantic tag aligned with the semantic-graph tag taxonomy.
   * Used for task routing and cost classification.
   */
  semanticTagSlug: string;
  /**
   * 0-based row index from the original OCR document.
   * Preserved for deterministic materialization order.
   */
  sourceIntentIndex: number;
}

// ---------------------------------------------------------------------------
// ParsingIntent status / source / review enums
// ---------------------------------------------------------------------------

export type ParsingIntentStatus =
  | "pending"
  | "importing"
  | "imported"
  | "failed"
  | "superseded";

export type ParsingIntentSourceType = "ai" | "human" | "system";
export type ParsingIntentReviewStatus = "pending_review" | "approved" | "rejected";

// ---------------------------------------------------------------------------
// ParsingIntent — Digital Twin aggregate
// ---------------------------------------------------------------------------

/**
 * ParsingIntent is the aggregate root for one document parsing result.
 *
 * Invariants:
 *   - lineItems is append-only after creation (immutable snapshot).
 *   - semanticHash is computed from lineItems and used for deduplication.
 *   - A non-superseded intent per sourceFileId must have a unique semanticHash.
 *   - Once `status` reaches "imported" it must not regress.
 */
export interface ParsingIntent {
  id: ParsingIntentId;
  workspaceId: string;
  sourceFileName: string;
  /** Immutable pointer to the file's Firebase Storage download URL. */
  sourceFileDownloadURL?: SourcePointer;
  /** Reference to the WorkspaceFile document (file.module FileEntity.id). */
  sourceFileId?: string;
  /** Reference to the exact FileVersion that was parsed. */
  sourceFileVersionId?: string;
  /** Storage object path used for parsing — used to trigger Document AI. */
  sourceFileStoragePath?: string;
  /** Monotonically increasing version counter; increments on re-parse. */
  intentVersion: number;
  /** Points to the newer intent that superseded this one. */
  supersededByIntentId?: ParsingIntentId;
  /** Lineage root for multi-version intent chains. */
  baseIntentId?: ParsingIntentId;
  lineItems: ParsedLineItem[];
  /** SHA-256 hash for semantic snapshot immutability verification. */
  semanticHash?: string;
  /** Parser provenance — stored for audit trail. */
  parserVersion?: string;
  modelVersion?: string;
  sourceType: ParsingIntentSourceType;
  /** Human-in-the-loop review state. */
  reviewStatus: ParsingIntentReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string; // ISO-8601
  status: ParsingIntentStatus;
  createdAt: string; // ISO-8601
  importedAt?: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// ParsingImport — Execution ledger
// ---------------------------------------------------------------------------

export type ParsingImportStatus = "started" | "applied" | "partial" | "failed";

/**
 * ParsingImport tracks one intent materialization attempt.
 *
 * Idempotency key format:  import:{intentId}:{intentVersion}
 * Stored in Firestore at:  workspaces/{workspaceId}/parsingImports/{idempotencyKey}
 */
export interface ParsingImport {
  id: string;
  workspaceId: string;
  intentId: ParsingIntentId;
  intentVersion: number;
  /** Firestore document ID — doubles as idempotency guard. */
  idempotencyKey: string;
  status: ParsingImportStatus;
  /** IDs of work items that were successfully created during this import. */
  appliedWorkItemIds: string[];
  startedAt: string; // ISO-8601
  completedAt?: string; // ISO-8601
  error?: {
    code: string;
    message: string;
  };
}

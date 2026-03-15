# Document AI Infrastructure — Architecture Design

> **Status:** Scaffolded (infrastructure ready; Cloud Function deployment pending)
> **Owner:** file.module + `src/infrastructure/document-ai/`

---

## Overview

The Document AI infrastructure provides a two-phase pipeline for extracting structured, semantically-enriched work items from uploaded documents (invoices, quotes, BOQ spreadsheets).

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1 — Document OCR              (Firebase Cloud Function)│
│  Firebase Storage → Google Cloud Document AI                 │
│  Output: OcrDocumentObject + .document-ai.json sidecar      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ Phase 2 — Semantic Extraction        (Next.js Server Action) │
│  OcrDocumentObject → Genkit (Gemini 2.5 Flash)              │
│  Output: ParsedWorkItem[] with semanticTagSlug               │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ saveParsingIntent                (file.module use case)     │
│  Stores ParsingIntent (Digital Twin) in Firestore           │
│  Deduplication via SHA-256 semanticHash                     │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ startParsingImport / finishParsingImport  (file.module)     │
│  Ledger entry for each materialization attempt              │
│  Idempotency key: import:{intentId}:{version}               │
└─────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
src/
├── infrastructure/
│   └── document-ai/             ← Genkit AI runtime (server-only)
│       ├── genkit.ts            ← Genkit instance (Gemini 2.5 Flash)
│       ├── index.ts             ← Public barrel
│       ├── flows/
│       │   └── extract-invoice-items.ts   ← AI flow
│       └── schemas/
│           └── docu-parse.ts    ← Zod schemas (OcrDocumentObject, ParsedWorkItem)
│
└── modules/
    └── file.module/
        ├── domain.file/
        │   ├── _parsing-intent.ts  ← ParsedLineItem, ParsingIntent, ParsingImport
        │   └── _ports.ts           ← IParsingIntentRepository, IParsingImportRepository
        ├── core/
        │   ├── _use-cases.ts       ← saveParsingIntent, startParsingImport, …
        │   └── _actions.ts         ← extractDataFromDocument Server Action
        ├── infra.firestore/
        │   ├── _repository.ts      ← FirestoreFileRepository (extended)
        │   └── parsing-intent-repository.ts
        └── _components/
            └── document-parser-view.tsx

functions/                       ← Firebase Cloud Functions (separate package)
└── src/
    ├── index.ts
    └── document-ai/
        └── process-document.fn.ts  ← processDocument HTTP function
```

---

## Phase 1: `processDocument` Cloud Function

| Property | Value |
|----------|-------|
| Trigger | HTTP POST |
| Region | asia-east1 |
| Timeout | 120 s |
| Max instances | 5 |
| Technology | Firebase Admin SDK + `@google-cloud/documentai` |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DOCAI_PROCESSOR_NAME` | ✅ | Full resource name: `projects/{id}/locations/{loc}/processors/{id}` |
| `DOCAI_ENDPOINT` | ❌ | Regional API endpoint (default: `asia-east1-documentai.googleapis.com`) |

### Request Body

```json
{
  "workspaceId": "ws_abc123",
  "fileId": "file_xyz789",
  "versionId": "ver_001",
  "mimeType": "application/pdf",
  "storagePath": "files/ws_abc123/file_xyz789/ver_001/quote.pdf"
}
```

### Response

```json
{
  "ok": true,
  "traceId": "uuid",
  "text": "OCR full text…",
  "entities": [{ "type": "line_item", "mentionText": "Steel pipe", "confidence": 0.97 }],
  "artifactDownloadURL": "https://…/quote.document-ai.json?alt=media&token=…",
  "artifactStoragePath": "files/ws_abc123/file_xyz789/ver_001/quote.document-ai.json"
}
```

### Side Effects

1. Writes `{filename}.document-ai.json` to Firebase Storage alongside the source file
2. Creates/updates a virtual Firestore file record for the sidecar at  
   `workspaces/{workspaceId}/files/{fileId}--document-ai-json`

---

## Phase 2: Genkit Semantic Extraction

| Property | Value |
|----------|-------|
| Runtime | Next.js Server Action (or Server Component) |
| AI Model | `googleai/gemini-2.5-flash` |
| Library | `genkit@1.x`, `@genkit-ai/google-genai@1.x` |
| Input | `OcrDocumentObject` from Phase 1 |
| Output | `ParsedWorkItem[]` |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENAI_API_KEY` | ✅ | Google AI Studio API key — **never expose to client** |

### ParsedWorkItem Schema

```typescript
{
  item: string;           // item description (料號/品名)
  quantity: number;       // 數量
  unitPrice: number;      // 單價
  discount?: number;      // 折扣
  price: number;          // 小計 (final after discount)
  semanticTagSlug: string; // e.g. "steel-pipe-supply"
  sourceIntentIndex: number; // 0-based row index (deterministic ordering)
}
```

---

## Domain Model (`file.module`)

### ParsingIntent — Digital Twin

Aggregate root representing one complete document parsing result.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `ParsingIntentId` | Branded Firestore doc ID |
| `workspaceId` | `string` | Owner workspace |
| `sourceFileId` | `string?` | Reference to FileEntity |
| `sourceFileVersionId` | `string?` | Reference to FileVersion |
| `lineItems` | `ParsedLineItem[]` | Extracted items (immutable after creation) |
| `semanticHash` | `string?` | SHA-256 of lineItems for deduplication |
| `status` | enum | `pending → importing → imported/failed/superseded` |

### ParsingImport — Execution Ledger

Tracks one materialization attempt (intent → work items).

| Field | Type | Description |
|-------|------|-------------|
| `idempotencyKey` | `string` | `import:{intentId}:{version}` — Firestore doc ID |
| `status` | enum | `started → applied/partial/failed` |
| `appliedWorkItemIds` | `string[]` | IDs of created work items |

### Firestore Layout

```
workspaces/{workspaceId}/
├── files/{fileId}                    ← FileEntity
├── parsingIntents/{intentId}         ← ParsingIntent aggregate
└── parsingImports/{idempotencyKey}   ← ParsingImport ledger
```

---

## Deduplication Strategy

Before creating a new `ParsingIntent`, the `saveParsingIntent` use case:

1. Computes `semanticHash = SHA-256(JSON.stringify(sorted lineItems))`
2. Queries for an existing non-superseded intent for the same `sourceFileId`
3. **Same hash** → returns the existing intent (true duplicate; no write)
4. **Different hash** → supersedes the old intent, creates a new one

This prevents duplicate task creation from repeated uploads of the same document.

---

## Deployment Checklist

### Cloud Function (`functions/`)

```bash
cd functions
npm install
npm run build

# Set environment variables in Firebase console or .env:
# DOCAI_PROCESSOR_NAME=projects/65970295651/locations/asia-east1/processors/YOUR_PROCESSOR_ID

firebase deploy --only functions
```

### Google Cloud Document AI Setup

1. Enable the Document AI API in your GCP project
2. Create a processor of type **Invoice Parser** in region `asia-east1`
3. Copy the full processor resource name to `DOCAI_PROCESSOR_NAME`

### Next.js App

```bash
# Add to .env.local (never commit):
GOOGLE_GENAI_API_KEY=your_google_ai_studio_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xuanwu-i-00708880-4e2d8
# Optional override:
# DOCAI_PROCESS_DOCUMENT_URL=https://asia-east1-xuanwu-i-00708880-4e2d8.cloudfunctions.net/processDocument
```

---

## Security Considerations

- `GOOGLE_GENAI_API_KEY` is **server-only** (not prefixed with `NEXT_PUBLIC_`)
- `processDocument` Cloud Function should be protected with Firebase App Check or a service-account-signed JWT in production
- OCR sidecar artifacts are stored in Firebase Storage with per-token download URLs (no public access)
- `ParsingIntent.lineItems` is immutable after creation to preserve the semantic audit trail

---

## Adapted from `7Spade/xuanwu`

This design is adapted from `7Spade/xuanwu/src/app-runtime/ai/` and
`src/shared-infra/firebase-admin/functions/src/document-ai/process-document.fn.ts`
to fit the **Modular DDD** architecture of `xuanwu-platform`:

| Reference (`xuanwu`) | This project (`xuanwu-platform`) |
|---|---|
| `src/app-runtime/ai/` | `src/infrastructure/document-ai/` |
| `workspace.slice/domain.document-parser/` | `file.module/domain.file/_parsing-intent.ts` |
| `shared-infra/firebase-admin/functions/` | `functions/` (separate npm workspace) |
| `_form-actions.ts` (feature slice) | `file.module/core/_actions.ts` (Server Action) |
| `_queries.ts` (Firestore subscribe) | `IParsingIntentRepository.subscribe()` (port) |

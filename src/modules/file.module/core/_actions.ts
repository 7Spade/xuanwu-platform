"use server";
/**
 * file.module — Document AI server actions.
 *
 * Two-phase document parsing pipeline:
 *   Phase 1 (DOCUMENT-AI):   POST to processDocument Cloud Function → OcrDocumentObject
 *   Phase 2 (GENKIT-AI):     OcrDocumentObject → Gemini 2.5 Flash → ParsedWorkItem[]
 *
 * Environment variables:
 *   DOCAI_PROCESS_DOCUMENT_URL       — override the Cloud Function endpoint (optional)
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID  — used to build the default endpoint
 */

import { extractInvoiceItems } from "@/infrastructure/document-ai/flows/extract-invoice-items";
import {
  OcrDocumentObjectSchema,
} from "@/infrastructure/document-ai/schemas/docu-parse";
import type {
  OcrDocumentObject,
  ParsedWorkItem,
} from "@/infrastructure/document-ai/schemas/docu-parse";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ParseMode = "document-ai" | "genkit-ai";

export type DocumentParseActionState = {
  data?: {
    workItems: ParsedWorkItem[];
    ocrDocument: OcrDocumentObject;
  };
  error?: string;
  fileName?: string;
  parseMode?: ParseMode;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getProcessDocumentEndpoint(): string {
  const explicit = process.env["DOCAI_PROCESS_DOCUMENT_URL"];
  if (explicit && explicit.trim().length > 0) return explicit.trim();

  const projectId =
    process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"] ??
    process.env["GOOGLE_CLOUD_PROJECT"];

  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required to resolve the processDocument endpoint. " +
      "Set DOCAI_PROCESS_DOCUMENT_URL to override.",
    );
  }

  const emulatorHost = process.env["FUNCTIONS_EMULATOR_HOST"];
  if (emulatorHost?.trim().length) {
    return `http://${emulatorHost}/${projectId}/asia-east1/processDocument`;
  }

  return `https://asia-east1-${projectId}.cloudfunctions.net/processDocument`;
}

async function readOcrSidecarFromDownloadURL(
  downloadURL: string,
): Promise<OcrDocumentObject> {
  const resp = await fetch(downloadURL, { cache: "no-store" });
  if (!resp.ok) {
    throw new Error(`Failed to fetch OCR sidecar (status=${resp.status})`);
  }
  const raw: unknown = await resp.json();
  // Validate against schema — rejects malformed / mismatched sidecar JSON early.
  const parsed = OcrDocumentObjectSchema.safeParse(
    (raw as Record<string, unknown>)["ocrDocument"] ?? raw,
  );
  if (!parsed.success) {
    throw new Error(
      `OCR sidecar failed schema validation: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Parses a document from the workspace files using either:
 *   "document-ai": calls the processDocument Cloud Function → Google Cloud Document AI
 *   "genkit-ai":   reads a pre-computed OCR sidecar → Gemini 2.5 Flash
 *
 * Form fields (all string):
 *   workspaceId, fileId, versionId  — required for document-ai mode
 *   storagePath, fileName, fileType — optional hints for Document AI
 *   downloadURL                     — required for genkit-ai mode (sidecar URL)
 *   parseMode                       — "document-ai" | "genkit-ai"
 */
export async function extractDataFromDocument(
  prevState: DocumentParseActionState,
  formData: FormData,
): Promise<DocumentParseActionState> {
  void prevState;

  const workspaceId = formData.get("workspaceId");
  const fileId = formData.get("fileId");
  const versionId = formData.get("versionId");
  const storagePath = formData.get("storagePath");
  const fileName = formData.get("fileName");
  const fileType = formData.get("fileType");
  const downloadURL = formData.get("downloadURL");
  const parseModeRaw = formData.get("parseMode");
  if (parseModeRaw !== "document-ai" && parseModeRaw !== "genkit-ai") {
    return {
      fileName: typeof formData.get("fileName") === "string"
        ? (formData.get("fileName") as string)
        : undefined,
      error: `Invalid parseMode: "${String(parseModeRaw)}". Must be "document-ai" or "genkit-ai".`,
    };
  }
  const parseMode: ParseMode = parseModeRaw;
  const fileNameStr = typeof fileName === "string" ? fileName : undefined;

  if (
    parseMode === "document-ai" &&
    (typeof workspaceId !== "string" ||
      !workspaceId ||
      typeof fileId !== "string" ||
      !fileId ||
      typeof versionId !== "string" ||
      !versionId)
  ) {
    return {
      fileName: fileNameStr,
      parseMode,
      error: "Please select a file from the Files tab before parsing.",
    };
  }

  if (
    parseMode === "genkit-ai" &&
    (typeof downloadURL !== "string" || !downloadURL)
  ) {
    return {
      fileName: fileNameStr,
      parseMode,
      error:
        "[genkit-ai] Missing sidecar downloadURL. Run DOCUMENT-AI first to produce *.document-ai.json.",
    };
  }

  try {
    let ocrDocument: OcrDocumentObject;

    if (parseMode === "genkit-ai") {
      ocrDocument = await readOcrSidecarFromDownloadURL(downloadURL as string);
    } else {
      const endpoint = getProcessDocumentEndpoint();
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          fileId,
          versionId,
          storagePath:
            typeof storagePath === "string" && storagePath ? storagePath : undefined,
          mimeType:
            typeof fileType === "string" && fileType ? fileType : undefined,
          fileName: fileNameStr,
        }),
        cache: "no-store",
      });

      if (!resp.ok) {
        let errorMsg = `Document AI request failed (status=${resp.status})`;
        const ct = resp.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const body = (await resp.json()) as { error?: string };
          if (body.error) errorMsg = body.error;
        }
        return { fileName: fileNameStr, parseMode, error: errorMsg };
      }

      const payload = (await resp.json()) as {
        ok?: boolean;
        text?: string;
        entities?: OcrDocumentObject["entities"];
        mimeType?: string;
        traceId?: string;
        extractedAt?: string;
        error?: string;
      };

      if (!payload.ok) {
        return {
          fileName: fileNameStr,
          parseMode,
          error: payload.error ?? "processDocument returned ok=false",
        };
      }

      ocrDocument = {
        source: "document-ocr-extractor",
        mimeType: payload.mimeType ?? (typeof fileType === "string" ? fileType : "application/octet-stream"),
        text: payload.text ?? "",
        entities: payload.entities ?? [],
        traceId: payload.traceId ?? crypto.randomUUID(),
        extractedAt: payload.extractedAt ?? new Date().toISOString(),
      };
    }

    if (parseMode === "genkit-ai") {
      const extraction = await extractInvoiceItems({ documentObject: ocrDocument });
      return {
        fileName: fileNameStr,
        parseMode,
        data: { workItems: extraction.workItems, ocrDocument },
      };
    }

    // document-ai mode: return OCR output only; caller may chain genkit-ai
    return {
      fileName: fileNameStr,
      parseMode,
      data: { workItems: [], ocrDocument },
    };
  } catch (err) {
    return {
      fileName: fileNameStr,
      parseMode,
      error: err instanceof Error ? err.message : "Unexpected parse error",
    };
  }
}

export type { FileDTO } from "./_use-cases";
export { uploadFile } from "./_use-cases";

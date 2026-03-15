"use client";
/**
 * DocumentParserView — Document Intelligence UI
 *
 * Two-phase document parsing workflow:
 *   Step 1 (DOCUMENT-AI)  — select a workspace file and trigger OCR extraction
 *   Step 2 (GENKIT-AI)    — extract structured line items from the OCR sidecar
 *
 * Both steps are driven by the `extractDataFromDocument` Server Action and
 * displayed as a result table with semantic tags and import controls.
 *
 * Usage:
 *   <DocumentParserView workspaceId={workspaceId} />
 */

import { useActionState, useRef, useState } from "react";
import type { ParsedWorkItem } from "@/infrastructure/document-ai/schemas/docu-parse";
import type { DocumentParseActionState } from "../core/_actions";
import { extractDataFromDocument } from "../core/_actions";
import { useFiles } from "./use-files";
import type { FileDTO, FileVersionDTO } from "../core/_use-cases";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FileSelectorRow({
  files,
  onSelect,
}: {
  files: FileDTO[];
  onSelect: (file: FileDTO, version: FileVersionDTO) => void;
}) {
  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const selectedFile = files.find((f) => f.id === selectedFileId);

  return (
    <div className="flex flex-col gap-2">
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={selectedFileId}
        onChange={(e) => setSelectedFileId(e.target.value)}
      >
        <option value="">— Select a file —</option>
        {files.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name} ({f.mimeType})
          </option>
        ))}
      </select>

      {selectedFile && selectedFile.versions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFile.versions.map((v) => (
            <button
              key={v.versionId}
              type="button"
              className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
              onClick={() => onSelect(selectedFile, v)}
            >
              {v.versionName} — {selectedFile.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ParsedItemsTable({ items }: { items: ParsedWorkItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Item</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Unit Price</th>
            <th className="px-3 py-2 text-right">Discount</th>
            <th className="px-3 py-2 text-right">Total</th>
            <th className="px-3 py-2 text-left">Semantic Tag</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.sourceIntentIndex}
              className="border-t border-border hover:bg-muted/50"
            >
              <td className="px-3 py-1.5 text-muted-foreground">
                {item.sourceIntentIndex + 1}
              </td>
              <td className="px-3 py-1.5">{item.description}</td>
              <td className="px-3 py-1.5 text-right">{item.quantity}</td>
              <td className="px-3 py-1.5 text-right">
                {item.unitPrice.toLocaleString()}
              </td>
              <td className="px-3 py-1.5 text-right">
                {(item.discount ?? 0).toLocaleString()}
              </td>
              <td className="px-3 py-1.5 text-right font-medium">
                {item.price.toLocaleString()}
              </td>
              <td className="px-3 py-1.5">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary">
                  {item.semanticTagSlug}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface SelectedFile {
  file: FileDTO;
  version: FileVersionDTO;
}

export function DocumentParserView({ workspaceId }: { workspaceId: string }) {
  const { files, loading: filesLoading } = useFiles(workspaceId);
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, dispatch, isPending] = useActionState<
    DocumentParseActionState,
    FormData
  >(extractDataFromDocument, {});

  function handleSelect(file: FileDTO, version: FileVersionDTO) {
    setSelected({ file, version });
  }

  if (filesLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Loading files…
      </div>
    );
  }

  const parsedItems = state.data?.workItems ?? [];
  const ocrText = state.data?.ocrDocument?.text;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="text-base font-semibold">Document AI Parser</h2>
        <p className="text-sm text-muted-foreground">
          Extract structured line items from invoices or quotes using Google
          Cloud Document AI + Gemini 2.5 Flash.
        </p>
      </div>

      {/* File selector */}
      <FileSelectorRow files={files} onSelect={handleSelect} />

      {selected && (
        <form ref={formRef} action={dispatch} className="flex flex-col gap-4">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="fileId" value={selected.file.id} />
          <input type="hidden" name="versionId" value={selected.version.versionId} />
          <input type="hidden" name="fileName" value={selected.file.name} />
          <input type="hidden" name="fileType" value={selected.file.mimeType} />
          {selected.version.downloadURL && (
            <input
              type="hidden"
              name="downloadURL"
              value={selected.version.downloadURL}
            />
          )}

          {/* Selected file summary */}
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
            <span className="font-medium">{selected.file.name}</span>{" "}
            <span className="text-muted-foreground">
              — {selected.version.versionName} ({selected.file.mimeType})
            </span>
          </div>

          {/* Parse mode selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Parse mode:</label>
            <select
              name="parseMode"
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              defaultValue="document-ai"
            >
              <option value="document-ai">DOCUMENT-AI (OCR only)</option>
              <option value="genkit-ai">GENKIT-AI (OCR → Gemini)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Parsing…" : "Parse Document"}
          </button>
        </form>
      )}

      {/* Error message */}
      {state.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* OCR text preview */}
      {ocrText && (
        <details className="rounded-md border border-border">
          <summary className="cursor-pointer px-4 py-2 text-sm font-medium">
            OCR Text ({ocrText.length} chars)
          </summary>
          <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap px-4 py-2 text-xs text-muted-foreground">
            {ocrText}
          </pre>
        </details>
      )}

      {/* Parsed items table */}
      {parsedItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">
            Extracted Items ({parsedItems.length})
          </h3>
          <ParsedItemsTable items={parsedItems} />
        </div>
      )}
    </div>
  );
}

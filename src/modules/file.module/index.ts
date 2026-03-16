// file.module — Public API barrel
// Bounded Context: File · FileVersion · Document Intelligence

// --- File use cases & DTOs ---
export type { FileDTO, FileVersionDTO, ParsedLineItemDTO, ParsingIntentDTO } from "./core/_use-cases";
export {
  uploadFile,
  markFileAsProcessing,
  saveParsingIntent,
  getParsingIntentsByWorkspace,
  startParsingImport,
  finishParsingImport,
  buildParsingImportIdempotencyKey,
} from "./core/_use-cases";
export { getFilesByWorkspace } from "./core/_queries";
export type { SaveParsingIntentInput, SaveParsingIntentResult, StartImportResult } from "./core/_use-cases";

// --- Port interfaces ---
export type {
  IFileRepository,
  IStoragePort,
  IParsingIntentRepository,
  IParsingImportRepository,
} from "./domain.file/_ports";

// --- Domain types (exposed for cross-module use case composition only) ---
export type { ParsedLineItem, ParsingIntent, ParsingImport } from "./domain.file/_parsing-intent";
export { getFileMimeGroup } from "./core/_mime";
export type { FileMimeGroup } from "./core/_mime";

// --- Presentation ---
export { useFiles } from "./_components/use-files";
export type { UseFilesResult } from "./_components/use-files";
export { FileItem } from "./_components/file-item";
export { FilePreview } from "./_components/file-preview";


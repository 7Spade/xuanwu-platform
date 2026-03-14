// file.module — Public API barrel
// Bounded Context: File · FileVersion · Document Intelligence
export type { FileDTO } from "./core/_use-cases";
export { uploadFile, getFilesByWorkspace } from "./core/_use-cases";
export type { IFileRepository, IStoragePort } from "./domain.file/_ports";
export { useFiles } from "./_components/use-files";
export type { UseFilesResult } from "./_components/use-files";
export { FileItem } from "./_components/file-item";

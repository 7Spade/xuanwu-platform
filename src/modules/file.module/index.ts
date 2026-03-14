// file.module — Public API barrel
// Bounded Context: File · FileVersion · Document Intelligence
export type { FileDTO } from "./core/_use-cases";
export { uploadFile, getFilesByWorkspace } from "./core/_use-cases";
export type { IFileRepository, IStoragePort } from "./domain.file/_ports";

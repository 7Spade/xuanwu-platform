import type { FileEntity } from "./_entity";
import type { FileId } from "./_value-objects";

export interface IFileRepository {
  findById(id: FileId): Promise<FileEntity | null>;
  findByWorkspaceId(workspaceId: string): Promise<FileEntity[]>;
  save(file: FileEntity): Promise<void>;
  deleteById(id: FileId): Promise<void>;
}

export interface IStoragePort {
  getDownloadURL(storagePath: string): Promise<string>;
  deleteFile(storagePath: string): Promise<void>;
}

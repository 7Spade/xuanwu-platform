import type { FileId } from "./_value-objects";

interface FileDomainEvent { readonly fileId: FileId; readonly occurredAt: string; }
export interface FileUploaded extends FileDomainEvent {
  readonly type: "file:uploaded"; readonly workspaceId: string; readonly versionId: string;
}
export interface DocumentParsed extends FileDomainEvent {
  readonly type: "file:document:parsed"; readonly parseStatus: "success" | "failed";
}
export type FileDomainEventUnion = FileUploaded | DocumentParsed;

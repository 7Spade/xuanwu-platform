import type { CommentId } from "./_value-objects";
export interface CommentPosted { readonly type: "collaboration:comment:posted"; readonly commentId: CommentId; readonly artifactId: string; readonly authorAccountId: string; readonly occurredAt: string; }
export type CollaborationDomainEventUnion = CommentPosted;

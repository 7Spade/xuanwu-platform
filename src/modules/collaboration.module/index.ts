// collaboration.module — Public API barrel
// Bounded Context: Collaboration · Comments · Reactions
export type { CommentDTO } from "./core/_use-cases";
export { postComment, getCommentsByArtifact } from "./core/_use-cases";
export type { ICommentRepository } from "./domain.collaboration/_ports";

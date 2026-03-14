import type { Comment } from "./_entity";
import type { CommentId } from "./_value-objects";
export interface ICommentRepository {
  findById(id: CommentId): Promise<Comment | null>;
  findByArtifact(artifactType: string, artifactId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
  deleteById(id: CommentId): Promise<void>;
}

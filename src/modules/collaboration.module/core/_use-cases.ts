import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import { buildComment } from "../domain.collaboration/_entity";
import type { CommentId } from "../domain.collaboration/_value-objects";
import type { ICommentRepository } from "../domain.collaboration/_ports";

export interface CommentDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly artifactType: string;
  readonly artifactId: string;
  readonly authorAccountId: string;
  readonly body: string;
  readonly parentId?: string;
  readonly createdAt: string;
}

export async function postComment(
  repo: ICommentRepository,
  id: string,
  workspaceId: string,
  artifactType: string,
  artifactId: string,
  authorAccountId: string,
  body: string,
  parentId?: string,
): Promise<Result<CommentDTO>> {
  try {
    const now = new Date().toISOString();
    const comment = buildComment(
      id as CommentId, workspaceId, artifactType, artifactId,
      authorAccountId, body, now,
      parentId as CommentId | undefined,
    );
    await repo.save(comment);
    return ok({ ...comment, parentId: comment.parentId });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getCommentsByArtifact(
  repo: ICommentRepository,
  artifactType: string,
  artifactId: string,
): Promise<Result<CommentDTO[]>> {
  try {
    const comments = await repo.findByArtifact(artifactType, artifactId);
    return ok(comments.map((c) => ({ ...c, parentId: c.parentId })));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

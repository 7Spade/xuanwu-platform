/**
 * Collaboration Firestore repository — implements ICommentRepository port.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the port interfaces, keeping Firebase out of
 * business logic.
 *
 * Storage layout:
 *   comments/{commentId}   — flat collection; indexed fields: workspaceId, artifactType, artifactId
 *   reactions/{reactionId} — flat collection; indexed fields: commentId, accountId
 *
 * Note: Real-time presence is handled by Firebase RTDB or Firestore onSnapshot
 * listeners at the presentation layer, not through this repository.
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import type { ICommentRepository } from "../domain.collaboration/_ports";
import type { Comment } from "../domain.collaboration/_entity";
import type { CommentId } from "../domain.collaboration/_value-objects";
import {
  commentDocToEntity,
  commentEntityToDoc,
  type CommentDoc,
} from "./_mapper";

const COMMENTS_COLLECTION = "comments";

// ---------------------------------------------------------------------------
// FirestoreCommentRepository
// ---------------------------------------------------------------------------

export class FirestoreCommentRepository implements ICommentRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: CommentId): Promise<Comment | null> {
    const ref = doc(this.db, COMMENTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return commentDocToEntity(snap.data() as CommentDoc);
  }

  async findByArtifact(
    artifactType: string,
    artifactId: string,
  ): Promise<Comment[]> {
    const col = collection(this.db, COMMENTS_COLLECTION);
    const q = query(
      col,
      where("artifactType", "==", artifactType),
      where("artifactId", "==", artifactId),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => commentDocToEntity(d.data() as CommentDoc));
  }

  async save(comment: Comment): Promise<void> {
    const ref = doc(this.db, COMMENTS_COLLECTION, comment.id);
    await setDoc(ref, commentEntityToDoc(comment));
  }

  /** Hard-deletes a comment document.  For soft-delete, call save() with deletedAt set. */
  async deleteById(id: CommentId): Promise<void> {
    const ref = doc(this.db, COMMENTS_COLLECTION, id);
    await deleteDoc(ref);
  }
}

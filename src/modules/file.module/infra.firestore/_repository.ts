/**
 * File Firestore repository — implements IFileRepository port.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the port interfaces, keeping Firebase out of
 * business logic.
 *
 * Storage layout:
 *   files/{fileId}     — flat collection; workspaceId is an indexed field
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
import type { IFileRepository } from "../domain.file/_ports";
import type { FileEntity } from "../domain.file/_entity";
import type { FileId } from "../domain.file/_value-objects";
import {
  fileEntityDocToEntity,
  fileEntityToDoc,
  type FileEntityDoc,
} from "./_mapper";

const FILES_COLLECTION = "files";

// ---------------------------------------------------------------------------
// FirestoreFileRepository
// ---------------------------------------------------------------------------

export class FirestoreFileRepository implements IFileRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: FileId): Promise<FileEntity | null> {
    const ref = doc(this.db, FILES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return fileEntityDocToEntity(snap.data() as FileEntityDoc);
  }

  async findByWorkspaceId(workspaceId: string): Promise<FileEntity[]> {
    const col = collection(this.db, FILES_COLLECTION);
    const q = query(col, where("workspaceId", "==", workspaceId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      fileEntityDocToEntity(d.data() as FileEntityDoc),
    );
  }

  async save(file: FileEntity): Promise<void> {
    const ref = doc(this.db, FILES_COLLECTION, file.id);
    await setDoc(ref, fileEntityToDoc(file));
  }

  async deleteById(id: FileId): Promise<void> {
    const ref = doc(this.db, FILES_COLLECTION, id);
    await deleteDoc(ref);
  }
}

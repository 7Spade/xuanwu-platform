/**
 * Namespace Firestore repository — implements INamespaceRepository.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the port interfaces, keeping Firebase out of
 * business logic.
 *
 * Slug uniqueness is enforced via a "slug reservation" document in the
 * `namespace-slugs` collection, which is checked and written atomically
 * inside a Firestore transaction so there are no TOCTOU race conditions.
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
  limit,
  runTransaction,
} from "firebase/firestore";
import type { INamespaceRepository } from "../domain.namespace/_ports";
import type { NamespaceEntity } from "../domain.namespace/_entity";
import type { NamespaceId, NamespaceSlug } from "../domain.namespace/_value-objects";
import {
  namespaceDocToEntity,
  namespaceEntityToDoc,
  type NamespaceDoc,
} from "./_mapper";

const NAMESPACES_COLLECTION = "namespaces";
/**
 * Shadow collection used as a uniqueness guard for namespace slugs.
 * Each document ID is the slug itself; its existence signals the slug is taken.
 */
const NAMESPACE_SLUGS_COLLECTION = "namespace-slugs";

// ---------------------------------------------------------------------------
// FirestoreNamespaceRepository
// ---------------------------------------------------------------------------

export class FirestoreNamespaceRepository implements INamespaceRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: NamespaceId): Promise<NamespaceEntity | null> {
    const ref = doc(this.db, NAMESPACES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return namespaceDocToEntity(snap.data() as NamespaceDoc);
  }

  async findBySlug(slug: NamespaceSlug): Promise<NamespaceEntity | null> {
    const col = collection(this.db, NAMESPACES_COLLECTION);
    // Slugs are unique by design — limit(1) avoids unnecessary data transfer.
    const q = query(col, where("slug", "==", slug), limit(1));
    const snaps = await getDocs(q);
    if (snaps.empty) return null;
    return namespaceDocToEntity(snaps.docs[0].data() as NamespaceDoc);
  }

  async findByOwnerId(ownerId: string): Promise<NamespaceEntity | null> {
    const col = collection(this.db, NAMESPACES_COLLECTION);
    // One namespace per owner is enforced by the domain; limit(1) makes it explicit.
    const q = query(col, where("ownerId", "==", ownerId), limit(1));
    const snaps = await getDocs(q);
    if (snaps.empty) return null;
    return namespaceDocToEntity(snaps.docs[0].data() as NamespaceDoc);
  }

  /**
   * Persists a NamespaceEntity.
   *
   * For new namespaces, the write is wrapped in a transaction that atomically:
   *   1. Reads the slug reservation document (tx.get — transactional read).
   *   2. If the reservation document already exists, throws to abort.
   *   3. Creates the reservation document and writes the namespace document.
   *
   * This pattern avoids non-transactional `getDocs` queries inside the
   * transaction body, eliminating the TOCTOU race condition.
   */
  async save(namespace: NamespaceEntity): Promise<void> {
    const db = this.db;
    const namespaceRef = doc(db, NAMESPACES_COLLECTION, namespace.id);
    const slugRef = doc(db, NAMESPACE_SLUGS_COLLECTION, namespace.slug);
    const data = namespaceEntityToDoc(namespace);

    await runTransaction(db, async (tx) => {
      const existing = await tx.get(namespaceRef);

      if (!existing.exists()) {
        // New namespace — atomically claim the slug reservation document.
        const slugSnap = await tx.get(slugRef);
        if (slugSnap.exists()) {
          throw new Error(
            `Namespace slug "${namespace.slug}" is already taken.`,
          );
        }
        // Reserve the slug and write the namespace in the same transaction.
        tx.set(slugRef, { namespaceId: namespace.id, reservedAt: namespace.createdAt });
      }

      tx.set(namespaceRef, data);
    });
  }

  async deleteById(id: NamespaceId): Promise<void> {
    const ref = doc(this.db, NAMESPACES_COLLECTION, id);
    await deleteDoc(ref);
  }
}

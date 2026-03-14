/**
 * Audit Firestore repository — implements IAuditRepository port.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the port interface, keeping Firebase out of
 * business logic.
 *
 * INVARIANT: AuditEntries are append-only.  This repository uses `setDoc`
 * only — never `updateDoc` or `deleteDoc`.  Firestore Security Rules must
 * enforce the same constraint at the storage layer.
 *
 * Storage layout:
 *   audit-entries/{entryId}   — flat collection; indexed fields: resource.resourceId,
 *                               resource.workspaceId, actor.accountId, occurredAt
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import type { IAuditRepository } from "../domain.audit/_ports";
import type { AuditEntry } from "../domain.audit/_entity";
import type { AuditEntryId } from "../domain.audit/_value-objects";
import {
  auditEntryDocToEntity,
  auditEntryToDoc,
  type AuditEntryDoc,
} from "./_mapper";

const AUDIT_ENTRIES_COLLECTION = "audit-entries";
const DEFAULT_LIMIT = 100;

// ---------------------------------------------------------------------------
// FirestoreAuditRepository
// ---------------------------------------------------------------------------

export class FirestoreAuditRepository implements IAuditRepository {
  private get db() {
    return getFirestore();
  }

  /** Appends a new audit entry.  Never mutates existing entries. */
  async append(entry: AuditEntry): Promise<void> {
    const ref = doc(this.db, AUDIT_ENTRIES_COLLECTION, entry.id);
    await setDoc(ref, auditEntryToDoc(entry));
  }

  async findById(id: AuditEntryId): Promise<AuditEntry | null> {
    const ref = doc(this.db, AUDIT_ENTRIES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return auditEntryDocToEntity(snap.data() as AuditEntryDoc);
  }

  async findByResourceId(
    resourceId: string,
    maxResults = DEFAULT_LIMIT,
  ): Promise<AuditEntry[]> {
    const col = collection(this.db, AUDIT_ENTRIES_COLLECTION);
    const q = query(
      col,
      where("resource.resourceId", "==", resourceId),
      orderBy("occurredAt", "desc"),
      firestoreLimit(maxResults),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      auditEntryDocToEntity(d.data() as AuditEntryDoc),
    );
  }

  async findByActorId(
    actorId: string,
    maxResults = DEFAULT_LIMIT,
  ): Promise<AuditEntry[]> {
    const col = collection(this.db, AUDIT_ENTRIES_COLLECTION);
    const q = query(
      col,
      where("actor.accountId", "==", actorId),
      orderBy("occurredAt", "desc"),
      firestoreLimit(maxResults),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      auditEntryDocToEntity(d.data() as AuditEntryDoc),
    );
  }

  async findByWorkspaceId(
    workspaceId: string,
    maxResults = DEFAULT_LIMIT,
  ): Promise<AuditEntry[]> {
    const col = collection(this.db, AUDIT_ENTRIES_COLLECTION);
    const q = query(
      col,
      where("resource.workspaceId", "==", workspaceId),
      orderBy("occurredAt", "desc"),
      firestoreLimit(maxResults),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      auditEntryDocToEntity(d.data() as AuditEntryDoc),
    );
  }
}

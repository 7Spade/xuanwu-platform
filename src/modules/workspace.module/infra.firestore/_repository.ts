/**
 * Workspace Firestore repository — implements IWorkspaceRepository and related ports.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the IWorkspaceRepository / IWorkspaceGrantRepository
 * port interfaces, keeping Firebase out of business logic.
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import type {
  IWorkspaceRepository,
  IWorkspaceGrantRepository,
} from "../domain.workspace/_ports";
import type { WorkspaceEntity, WorkspaceGrant } from "../domain.workspace/_entity";
import type { WorkspaceId, WorkspaceRole } from "../domain.workspace/_value-objects";
import {
  workspaceDocToEntity,
  workspaceEntityToDoc,
  type WorkspaceDoc,
  type WorkspaceGrantDoc,
} from "./_mapper";

const WORKSPACES_COLLECTION = "workspaces";

// ---------------------------------------------------------------------------
// IWorkspaceRepository implementation
// ---------------------------------------------------------------------------

export class FirestoreWorkspaceRepository implements IWorkspaceRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: WorkspaceId): Promise<WorkspaceEntity | null> {
    const ref = doc(this.db, WORKSPACES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const raw = { id: snap.id, ...snap.data() } as WorkspaceDoc;
    return workspaceDocToEntity(raw);
  }

  async findByDimensionId(dimensionId: string): Promise<WorkspaceEntity[]> {
    const col = collection(this.db, WORKSPACES_COLLECTION);
    const q = query(col, where("dimensionId", "==", dimensionId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const raw = { id: d.id, ...d.data() } as WorkspaceDoc;
      return workspaceDocToEntity(raw);
    });
  }

  async save(workspace: WorkspaceEntity): Promise<void> {
    const ref = doc(this.db, WORKSPACES_COLLECTION, workspace.id);
    const data = workspaceEntityToDoc(workspace);
    await setDoc(ref, data, { merge: true });
  }

  async deleteById(id: WorkspaceId): Promise<void> {
    const ref = doc(this.db, WORKSPACES_COLLECTION, id);
    await deleteDoc(ref);
  }
}

// ---------------------------------------------------------------------------
// IWorkspaceGrantRepository implementation
// ---------------------------------------------------------------------------

export class FirestoreWorkspaceGrantRepository
  implements IWorkspaceGrantRepository
{
  private get db() {
    return getFirestore();
  }

  async findByWorkspaceId(workspaceId: WorkspaceId): Promise<WorkspaceGrant[]> {
    const ref = doc(this.db, WORKSPACES_COLLECTION, workspaceId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const raw = snap.data() as WorkspaceDoc;
    return (raw.grants ?? []).map((g: WorkspaceGrantDoc) => ({
      grantId: g.grantId,
      userId: g.userId,
      role: g.role as WorkspaceRole,
      status: g.status as "active" | "revoked" | "expired",
      grantedAt: g.grantedAt,
      ...(g.revokedAt != null ? { revokedAt: g.revokedAt } : {}),
      ...(g.expiresAt != null ? { expiresAt: g.expiresAt } : {}),
    }));
  }

  async addGrant(
    workspaceId: WorkspaceId,
    grant: WorkspaceGrant,
  ): Promise<void> {
    const ref = doc(this.db, WORKSPACES_COLLECTION, workspaceId);
    const grantDoc: WorkspaceGrantDoc = {
      grantId: grant.grantId,
      userId: grant.userId,
      role: grant.role,
      status: grant.status,
      grantedAt: grant.grantedAt,
      revokedAt: grant.revokedAt ?? null,
      expiresAt: grant.expiresAt ?? null,
    };
    await updateDoc(ref, { grants: arrayUnion(grantDoc) });
  }

  async revokeGrant(
    workspaceId: WorkspaceId,
    grantId: string,
    now: string,
  ): Promise<void> {
    const ref = doc(this.db, WORKSPACES_COLLECTION, workspaceId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const raw = snap.data() as WorkspaceDoc;
    const updatedGrants = (raw.grants ?? []).map((g: WorkspaceGrantDoc) =>
      g.grantId === grantId
        ? { ...g, status: "revoked", revokedAt: now }
        : g,
    );
    await updateDoc(ref, { grants: updatedGrants });
  }

  async updateRole(
    workspaceId: WorkspaceId,
    grantId: string,
    newRole: WorkspaceRole,
  ): Promise<void> {
    const ref = doc(this.db, WORKSPACES_COLLECTION, workspaceId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const raw = snap.data() as WorkspaceDoc;
    const updatedGrants = (raw.grants ?? []).map((g: WorkspaceGrantDoc) =>
      g.grantId === grantId ? { ...g, role: newRole } : g,
    );
    await updateDoc(ref, { grants: updatedGrants });
  }
}

/**
 * Firestore repository for Issue entities.
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
  orderBy,
} from "firebase/firestore";
import type { IIssueRepository } from "../domain.issues/_ports";
import type { IssueEntity } from "../domain.issues/_entity";
import type { IssueId, IssueStatus, IssueSeverity } from "../domain.issues/_entity";

const COL = "workspaceIssues";

interface IssueDoc {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: string;
  severity: string;
  reporterId: string;
  assigneeId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function docToEntity(d: IssueDoc): IssueEntity {
  return {
    id: d.id as IssueId,
    workspaceId: d.workspaceId,
    title: d.title,
    ...(d.description != null ? { description: d.description } : {}),
    status: d.status as IssueStatus,
    severity: d.severity as IssueSeverity,
    reporterId: d.reporterId,
    ...(d.assigneeId != null ? { assigneeId: d.assigneeId } : {}),
    ...(d.resolvedAt != null ? { resolvedAt: d.resolvedAt } : {}),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

function entityToDoc(e: IssueEntity): IssueDoc {
  return {
    id: e.id,
    workspaceId: e.workspaceId,
    title: e.title,
    description: e.description ?? null,
    status: e.status,
    severity: e.severity,
    reporterId: e.reporterId,
    assigneeId: e.assigneeId ?? null,
    resolvedAt: e.resolvedAt ?? null,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export class FirestoreIssueRepository implements IIssueRepository {
  private get db() { return getFirestore(); }

  async findById(id: IssueId): Promise<IssueEntity | null> {
    const snap = await getDoc(doc(this.db, COL, id));
    if (!snap.exists()) return null;
    return docToEntity(snap.data() as IssueDoc);
  }

  async findByWorkspaceId(workspaceId: string): Promise<IssueEntity[]> {
    const q = query(
      collection(this.db, COL),
      where("workspaceId", "==", workspaceId),
      orderBy("createdAt", "desc"),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => docToEntity(d.data() as IssueDoc));
  }

  async save(issue: IssueEntity): Promise<void> {
    await setDoc(doc(this.db, COL, issue.id), entityToDoc(issue));
  }

  async deleteById(id: IssueId): Promise<void> {
    await deleteDoc(doc(this.db, COL, id));
  }
}

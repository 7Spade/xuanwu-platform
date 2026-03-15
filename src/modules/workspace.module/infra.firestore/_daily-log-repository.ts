/**
 * Firestore repository for DailyLog entities.
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
import type { IDailyLogRepository } from "../domain.daily/_ports";
import type { DailyLogEntity } from "../domain.daily/_entity";
import type { DailyLogId } from "../domain.daily/_entity";

const COL = "dailyLogs";

interface DailyLogDoc {
  id: string;
  workspaceId: string;
  date: string;
  content: string;
  photoURLs: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

function docToEntity(d: DailyLogDoc): DailyLogEntity {
  return {
    id: d.id as DailyLogId,
    workspaceId: d.workspaceId,
    date: d.date,
    content: d.content,
    photoURLs: d.photoURLs ?? [],
    authorId: d.authorId,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

function entityToDoc(e: DailyLogEntity): DailyLogDoc {
  return {
    id: e.id,
    workspaceId: e.workspaceId,
    date: e.date,
    content: e.content,
    photoURLs: [...e.photoURLs],
    authorId: e.authorId,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

export class FirestoreDailyLogRepository implements IDailyLogRepository {
  private get db() { return getFirestore(); }

  async findById(id: DailyLogId): Promise<DailyLogEntity | null> {
    const snap = await getDoc(doc(this.db, COL, id));
    if (!snap.exists()) return null;
    return docToEntity(snap.data() as DailyLogDoc);
  }

  async findByWorkspaceId(workspaceId: string): Promise<DailyLogEntity[]> {
    const q = query(
      collection(this.db, COL),
      where("workspaceId", "==", workspaceId),
      orderBy("date", "desc"),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => docToEntity(d.data() as DailyLogDoc));
  }

  async save(log: DailyLogEntity): Promise<void> {
    await setDoc(doc(this.db, COL, log.id), entityToDoc(log));
  }

  async deleteById(id: DailyLogId): Promise<void> {
    await deleteDoc(doc(this.db, COL, id));
  }
}

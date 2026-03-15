/**
 * file.module — ParsingIntent Firestore repository.
 *
 * Implements IParsingIntentRepository and IParsingImportRepository ports.
 *
 * Firestore layout:
 *   workspaces/{workspaceId}/parsingIntents/{intentId}
 *   workspaces/{workspaceId}/parsingImports/{idempotencyKey}
 */

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import type {
  IParsingIntentRepository,
  IParsingImportRepository,
} from "../domain.file/_ports";
import type {
  ParsingIntent,
  ParsingIntentId,
  ParsingImport,
  ParsingImportStatus,
} from "../domain.file/_parsing-intent";

const PARSING_INTENTS = "parsingIntents";
const PARSING_IMPORTS = "parsingImports";

// ---------------------------------------------------------------------------
// FirestoreParsingIntentRepository
// ---------------------------------------------------------------------------

export class FirestoreParsingIntentRepository
  implements IParsingIntentRepository
{
  private db() {
    return getFirestore();
  }

  private intentRef(workspaceId: string) {
    return collection(this.db(), "workspaces", workspaceId, PARSING_INTENTS);
  }

  async create(
    workspaceId: string,
    intent: Omit<ParsingIntent, "id">,
  ): Promise<string> {
    const ref = await addDoc(this.intentRef(workspaceId), {
      ...intent,
      createdAt: intent.createdAt ?? serverTimestamp(),
    });
    return ref.id;
  }

  async findById(
    workspaceId: string,
    id: ParsingIntentId,
  ): Promise<ParsingIntent | null> {
    const ref = doc(this.db(), "workspaces", workspaceId, PARSING_INTENTS, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id as ParsingIntentId, ...(snap.data() as Omit<ParsingIntent, "id">) };
  }

  async findBySourceFileId(
    workspaceId: string,
    sourceFileId: string,
  ): Promise<ParsingIntent | null> {
    const q = query(
      this.intentRef(workspaceId),
      where("sourceFileId", "==", sourceFileId),
      where("status", "!=", "superseded"),
      orderBy("status"),
      orderBy("createdAt", "desc"),
    );
    const snaps = await getDocs(q);
    if (snaps.empty) return null;
    const first = snaps.docs[0]!;
    return { id: first.id as ParsingIntentId, ...(first.data() as Omit<ParsingIntent, "id">) };
  }

  async updateStatus(
    workspaceId: string,
    id: ParsingIntentId,
    status: ParsingIntent["status"],
  ): Promise<void> {
    const ref = doc(this.db(), "workspaces", workspaceId, PARSING_INTENTS, id);
    const update: Record<string, unknown> = { status };
    if (status === "imported") update["importedAt"] = new Date().toISOString();
    await updateDoc(ref, update);
  }

  async supersede(
    workspaceId: string,
    oldId: ParsingIntentId,
    newId: ParsingIntentId,
  ): Promise<void> {
    const ref = doc(
      this.db(),
      "workspaces",
      workspaceId,
      PARSING_INTENTS,
      oldId,
    );
    await updateDoc(ref, {
      status: "superseded",
      supersededByIntentId: newId,
    });
  }

  subscribe(
    workspaceId: string,
    onUpdate: (intents: ParsingIntent[]) => void,
  ): () => void {
    const q = query(
      this.intentRef(workspaceId),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      const intents = snap.docs.map(
        (d) => ({ id: d.id as ParsingIntentId, ...(d.data() as Omit<ParsingIntent, "id">) }),
      );
      onUpdate(intents);
    });
  }
}

// ---------------------------------------------------------------------------
// FirestoreParsingImportRepository
// ---------------------------------------------------------------------------

export class FirestoreParsingImportRepository
  implements IParsingImportRepository
{
  private db() {
    return getFirestore();
  }

  private importRef(workspaceId: string) {
    return collection(this.db(), "workspaces", workspaceId, PARSING_IMPORTS);
  }

  async create(
    workspaceId: string,
    entry: Omit<ParsingImport, "id">,
  ): Promise<string> {
    const ref = await addDoc(this.importRef(workspaceId), {
      ...entry,
      startedAt: entry.startedAt ?? serverTimestamp(),
    });
    return ref.id;
  }

  async findByIdempotencyKey(
    workspaceId: string,
    key: string,
  ): Promise<ParsingImport | null> {
    const q = query(
      this.importRef(workspaceId),
      where("idempotencyKey", "==", key),
    );
    const snaps = await getDocs(q);
    if (snaps.empty) return null;
    const first = snaps.docs[0]!;
    return { id: first.id, ...(first.data() as Omit<ParsingImport, "id">) };
  }

  async updateStatus(
    workspaceId: string,
    importId: string,
    update: {
      status: ParsingImportStatus;
      appliedWorkItemIds: string[];
      error?: { code: string; message: string };
    },
  ): Promise<void> {
    const ref = doc(this.db(), "workspaces", workspaceId, PARSING_IMPORTS, importId);
    await updateDoc(ref, {
      status: update.status,
      appliedWorkItemIds: update.appliedWorkItemIds,
      completedAt: new Date().toISOString(),
      ...(update.error ? { error: update.error } : {}),
    });
  }
}

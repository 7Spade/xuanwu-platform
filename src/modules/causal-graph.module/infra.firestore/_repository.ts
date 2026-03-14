/**
 * causal-graph.module / infra.firestore / _repository.ts
 *
 * Implements ICausalNodeRepository and ICausalEdgeRepository against Firestore.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the port interfaces, keeping Firebase out of
 * business logic.
 *
 * Storage layout:
 *   causal-nodes/{nodeId}   — indexed fields: sourceRef
 *   causal-edges/{edgeId}   — indexed fields: causeNodeId, effectNodeId
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
  limit as firestoreLimit,
} from "firebase/firestore";
import type {
  ICausalNodeRepository,
  ICausalEdgeRepository,
} from "../domain.causal-graph/_ports";
import type { CausalNode, CausalEdge, CausalNodeId } from "../domain.causal-graph/_entity";
import {
  causalNodeDocToEntity,
  causalNodeToDoc,
  causalEdgeDocToEntity,
  causalEdgeToDoc,
  type CausalNodeDoc,
  type CausalEdgeDoc,
} from "./_mapper";

const CAUSAL_NODES_COLLECTION = "causal-nodes";
const CAUSAL_EDGES_COLLECTION = "causal-edges";

// ---------------------------------------------------------------------------
// FirestoreCausalNodeRepository
// ---------------------------------------------------------------------------

export class FirestoreCausalNodeRepository implements ICausalNodeRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: CausalNodeId): Promise<CausalNode | null> {
    const ref = doc(this.db, CAUSAL_NODES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return causalNodeDocToEntity(snap.data() as CausalNodeDoc);
  }

  async findBySourceRef(sourceRef: string): Promise<CausalNode | null> {
    const col = collection(this.db, CAUSAL_NODES_COLLECTION);
    const q = query(
      col,
      where("sourceRef", "==", sourceRef),
      firestoreLimit(1),
    );
    const snaps = await getDocs(q);
    if (snaps.empty) return null;
    return causalNodeDocToEntity(snaps.docs[0]!.data() as CausalNodeDoc);
  }

  async save(node: CausalNode): Promise<void> {
    const ref = doc(this.db, CAUSAL_NODES_COLLECTION, node.id);
    await setDoc(ref, causalNodeToDoc(node));
  }
}

// ---------------------------------------------------------------------------
// FirestoreCausalEdgeRepository
// ---------------------------------------------------------------------------

export class FirestoreCausalEdgeRepository implements ICausalEdgeRepository {
  private get db() {
    return getFirestore();
  }

  async findByCauseNodeId(nodeId: CausalNodeId): Promise<CausalEdge[]> {
    const col = collection(this.db, CAUSAL_EDGES_COLLECTION);
    const q = query(col, where("causeNodeId", "==", nodeId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      causalEdgeDocToEntity(d.data() as CausalEdgeDoc),
    );
  }

  async findByEffectNodeId(nodeId: CausalNodeId): Promise<CausalEdge[]> {
    const col = collection(this.db, CAUSAL_EDGES_COLLECTION);
    const q = query(col, where("effectNodeId", "==", nodeId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      causalEdgeDocToEntity(d.data() as CausalEdgeDoc),
    );
  }

  async save(edge: CausalEdge): Promise<void> {
    const ref = doc(this.db, CAUSAL_EDGES_COLLECTION, edge.id);
    await setDoc(ref, causalEdgeToDoc(edge));
  }
}

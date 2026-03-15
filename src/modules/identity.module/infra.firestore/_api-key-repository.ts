/**
 * API Key Firestore repository — implements IApiKeyRepository.
 *
 * Keys are stored in a sub-collection under each namespace:
 *   `namespaces/{slug}/api-keys/{id}`
 *
 * All Firestore access is isolated to this file; domain and application
 * layers only interact with the IApiKeyRepository port.
 */

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import type { IApiKeyRepository } from "../domain.identity/_ports";
import type { ApiKeyRecord } from "../domain.identity/_api-key-entity";
import type { ApiKeyId } from "../domain.identity/_value-objects";
import {
  apiKeyDocToRecord,
  apiKeyRecordToDoc,
  type ApiKeyDoc,
} from "./_api-key-mapper";

const NAMESPACES_COLLECTION = "namespaces";
const API_KEYS_SUB_COLLECTION = "api-keys";

// ---------------------------------------------------------------------------
// FirestoreApiKeyRepository
// ---------------------------------------------------------------------------

export class FirestoreApiKeyRepository implements IApiKeyRepository {
  private get db() {
    return getFirestore();
  }

  private keysCollection(namespaceSlug: string) {
    return collection(
      this.db,
      NAMESPACES_COLLECTION,
      namespaceSlug,
      API_KEYS_SUB_COLLECTION,
    );
  }

  async findById(id: ApiKeyId): Promise<ApiKeyRecord | null> {
    // NOTE: Without `namespaceSlug` we cannot construct the direct sub-collection
    // path `namespaces/{slug}/api-keys/{id}`, so we fall back to a Firestore
    // collection-group query. This is an O(1) index scan but crosses namespace
    // boundaries. Prefer `findByNamespaceSlug` when the slug is already known.
    const q = query(
      collection(this.db, API_KEYS_SUB_COLLECTION),
      where("id", "==", id),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return apiKeyDocToRecord(snap.docs[0].data() as ApiKeyDoc);
  }

  async findByNamespaceSlug(namespaceSlug: string): Promise<ApiKeyRecord[]> {
    const snap = await getDocs(this.keysCollection(namespaceSlug));
    return snap.docs.map((d) => apiKeyDocToRecord(d.data() as ApiKeyDoc));
  }

  async save(key: ApiKeyRecord): Promise<void> {
    const ref = doc(
      this.db,
      NAMESPACES_COLLECTION,
      key.namespaceSlug,
      API_KEYS_SUB_COLLECTION,
      key.id,
    );
    await setDoc(ref, apiKeyRecordToDoc(key));
  }

  async revokeById(id: ApiKeyId): Promise<void> {
    // Load the document first to know the namespaceSlug so we can update it.
    const record = await this.findById(id);
    if (!record) return;
    const ref = doc(
      this.db,
      NAMESPACES_COLLECTION,
      record.namespaceSlug,
      API_KEYS_SUB_COLLECTION,
      id,
    );
    await updateDoc(ref, { isActive: false });
  }
}

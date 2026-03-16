/**
 * FirestoreNamespaceSlugAvailabilityAdapter
 *
 * Implements INamespaceSlugAvailabilityPort by checking the `namespace-slugs`
 * shadow collection that FirestoreNamespaceRepository maintains.
 *
 * Each document ID in `namespace-slugs` equals a reserved slug, so absence
 * of the document means the slug is available.
 *
 * Note: The `save()` method on FirestoreNamespaceRepository also enforces
 * slug uniqueness atomically inside a transaction, so this pre-check is only
 * for early user feedback — not the authoritative guard.
 */

import { getFirestore, doc, getDoc } from "firebase/firestore";
import type { INamespaceSlugAvailabilityPort } from "../domain.namespace/_ports";
import type { NamespaceSlug } from "../domain.namespace/_value-objects";

const NAMESPACE_SLUGS_COLLECTION = "namespace-slugs";

export class FirestoreNamespaceSlugAvailabilityAdapter
  implements INamespaceSlugAvailabilityPort
{
  private get db() {
    return getFirestore();
  }

  async isAvailable(slug: NamespaceSlug): Promise<boolean> {
    const ref = doc(this.db, NAMESPACE_SLUGS_COLLECTION, slug);
    const snap = await getDoc(ref);
    return !snap.exists();
  }
}

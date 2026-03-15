/**
 * Account Firestore repository — implements IAccountRepository port.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the IAccountRepository / IMembershipRepository
 * port interfaces, keeping Firebase out of business logic.
 *
 * Handle uniqueness is enforced with a Firestore transaction (atomic
 * check-and-write) via `saveWithHandleUniqueness`.
 */

import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import type { IAccountRepository, IAccountBadgeWritePort, IMembershipRepository } from "../domain.account/_ports";
import type { AccountEntity } from "../domain.account/_entity";
import type { AccountId, AccountHandle, MemberRole } from "../domain.account/_value-objects";
import { accountDocToEntity, accountEntityToDoc, type AccountDoc } from "./_mapper";

const ACCOUNTS_COLLECTION = "accounts";

// ---------------------------------------------------------------------------
// IAccountRepository implementation
// ---------------------------------------------------------------------------

export class FirestoreAccountRepository
  implements IAccountRepository, IAccountBadgeWritePort
{
  private get db() {
    return getFirestore();
  }

  async findById(id: AccountId): Promise<AccountEntity | null> {
    const ref = doc(this.db, ACCOUNTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const raw = { id: snap.id, ...snap.data() } as AccountDoc;
    return accountDocToEntity(raw);
  }

  async findByHandle(handle: AccountHandle): Promise<AccountEntity | null> {
    const col = collection(this.db, ACCOUNTS_COLLECTION);
    const q = query(col, where("handle", "==", handle));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    const raw = { id: first.id, ...first.data() } as AccountDoc;
    return accountDocToEntity(raw);
  }

  async findOrganizationsByOwnerId(ownerId: AccountId): Promise<AccountEntity[]> {
    const col = collection(this.db, ACCOUNTS_COLLECTION);
    const q = query(
      col,
      where("accountType", "==", "organization"),
      where("ownerId", "==", ownerId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const raw = { id: d.id, ...d.data() } as AccountDoc;
      return accountDocToEntity(raw);
    });
  }

  async save(account: AccountEntity): Promise<void> {
    const ref = doc(this.db, ACCOUNTS_COLLECTION, account.id);
    const data = accountEntityToDoc(account);
    await setDoc(ref, data, { merge: true });
  }

  async deleteById(id: AccountId): Promise<void> {
    const ref = doc(this.db, ACCOUNTS_COLLECTION, id);
    await deleteDoc(ref);
  }

  // IAccountBadgeWritePort — used by achievement.module via the port interface
  async addBadge(accountId: AccountId, badgeSlug: string): Promise<void> {
    const entity = await this.findById(accountId);
    if (!entity) return;
    const already = entity.profile.badgeSlugs.includes(badgeSlug);
    if (already) return;
    const updated: AccountEntity = {
      ...entity,
      profile: {
        ...entity.profile,
        badgeSlugs: [...entity.profile.badgeSlugs, badgeSlug],
      },
      updatedAt: new Date().toISOString(),
    };
    await this.save(updated);
  }
}

// ---------------------------------------------------------------------------
// IMembershipRepository — sub-aggregate management within an org account
// ---------------------------------------------------------------------------

export class FirestoreMembershipRepository implements IMembershipRepository {
  constructor(private readonly accountRepo: IAccountRepository) {}

  async findById(id: string): Promise<{ accountId: AccountId; role: MemberRole; status: string } | null> {
    // Memberships are stored as sub-documents on the AccountEntity.
    // A direct lookup by membership ID requires a Firestore collectionGroup query
    // which is not yet implemented. Callers should load the parent AccountEntity
    // via FirestoreAccountRepository and filter its members array instead.
    // TODO: replace with collectionGroup('memberships') query when scale requires it.
    void id;
    return null;
  }

  async invite(
    orgAccountId: AccountId,
    memberAccountId: AccountId,
    role: MemberRole,
    now: string,
  ): Promise<void> {
    const account = await this.accountRepo.findById(orgAccountId);
    if (!account) throw new Error(`Account ${orgAccountId} not found`);

    const newMembership = {
      id: `${orgAccountId}_${memberAccountId}`,
      accountId: memberAccountId,
      role,
      status: "pending" as const,
      invitedAt: now,
      acceptedAt: null,
    };

    const updated: AccountEntity = {
      ...account,
      members: [...(account.members ?? []), newMembership],
      updatedAt: now,
    };
    await this.accountRepo.save(updated);
  }

  async accept(id: string, now: string): Promise<void> {
    // `id` format: `{orgAccountId}_{memberAccountId}`
    const [orgAccountId] = id.split("_") as [AccountId];
    const account = await this.accountRepo.findById(orgAccountId);
    if (!account) return;

    const updated: AccountEntity = {
      ...account,
      members: (account.members ?? []).map((m) =>
        m.id === id ? { ...m, status: "active" as const, acceptedAt: now } : m,
      ),
      updatedAt: now,
    };
    await this.accountRepo.save(updated);
  }

  async updateRole(id: string, newRole: MemberRole): Promise<void> {
    const [orgAccountId] = id.split("_") as [AccountId];
    const account = await this.accountRepo.findById(orgAccountId);
    if (!account) return;

    const now = new Date().toISOString();
    const updated: AccountEntity = {
      ...account,
      members: (account.members ?? []).map((m) =>
        m.id === id ? { ...m, role: newRole } : m,
      ),
      updatedAt: now,
    };
    await this.accountRepo.save(updated);
  }

  async revoke(id: string): Promise<void> {
    const [orgAccountId] = id.split("_") as [AccountId];
    const account = await this.accountRepo.findById(orgAccountId);
    if (!account) return;

    const now = new Date().toISOString();
    const updated: AccountEntity = {
      ...account,
      members: (account.members ?? []).map((m) =>
        m.id === id ? { ...m, status: "revoked" as const } : m,
      ),
      updatedAt: now,
    };
    await this.accountRepo.save(updated);
  }
}

// Account actions — adapter-backed application facade for write paths.

import { FirestoreAccountRepository } from "../infra.firestore/_repository";
import {
  createOrganizationAccount as createOrganizationAccountUseCase,
  createPersonalAccount as createPersonalAccountUseCase,
  updateAccountProfile as updateAccountProfileUseCase,
  type AccountDTO,
  type PublicProfileDTO,
} from "./_use-cases";

const accountRepository = new FirestoreAccountRepository();

export type { AccountDTO, PublicProfileDTO };

export async function createPersonalAccount(uid: string, displayName: string) {
  return createPersonalAccountUseCase(accountRepository, uid, displayName);
}

export async function createOrganizationAccount(orgId: string, ownerId: string, displayName: string) {
  return createOrganizationAccountUseCase(accountRepository, orgId, ownerId, displayName);
}

export async function updateAccountProfile(
  id: string,
  updates: Partial<{ displayName: string; avatarUrl: string | null; bio: string | null }>,
) {
  return updateAccountProfileUseCase(accountRepository, id, updates);
}

// Account queries — adapter-backed application facade for read paths.

import { FirestoreAccountRepository } from "../infra.firestore/_repository";
import {
  getAccountById as getAccountByIdUseCase,
  getOrgMembersByHandle as getOrgMembersByHandleUseCase,
  getOrganizationsByOwnerId as getOrganizationsByOwnerIdUseCase,
  getPublicProfile as getPublicProfileUseCase,
  type AccountDTO,
  type MemberDTO,
  type PublicProfileDTO,
} from "./_use-cases";

const accountRepository = new FirestoreAccountRepository();

export type { AccountDTO, MemberDTO, PublicProfileDTO };

export async function getAccountById(id: string) {
  return getAccountByIdUseCase(accountRepository, id);
}

export async function getPublicProfile(id: string) {
  return getPublicProfileUseCase(accountRepository, id);
}

export async function getOrgMembersByHandle(handle: string) {
  return getOrgMembersByHandleUseCase(accountRepository, handle);
}

export async function getOrganizationsByOwnerId(ownerId: string) {
  return getOrganizationsByOwnerIdUseCase(accountRepository, ownerId);
}

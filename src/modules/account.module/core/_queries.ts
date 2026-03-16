import { FirestoreAccountRepository } from "../infra.firestore/_repository";
import {
  getAccountById as getAccountByIdUseCase,
  getOrgMembersByHandle as getOrgMembersByHandleUseCase,
  getOrganizationsByOwnerId as getOrganizationsByOwnerIdUseCase,
  getPublicProfile as getPublicProfileUseCase,
  getUserRoleInOrganization as getUserRoleInOrganizationUseCase,
  type AccountDTO,
  type MemberDTO,
  type PublicProfileDTO,
} from "./_use-cases";
import type { MemberRole } from "../domain.account/_value-objects";

const accountRepository = new FirestoreAccountRepository();

export type { AccountDTO, MemberDTO, PublicProfileDTO };
export type { MemberRole };

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

export async function getUserRoleInOrganization(userId: string, orgId: string) {
  return getUserRoleInOrganizationUseCase(accountRepository, userId, orgId);
}

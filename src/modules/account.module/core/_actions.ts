'use server';
// Account server actions — thin 'use server' wrappers over application use cases.
// Wire port interfaces to real infrastructure adapters once infra.firestore is implemented.

export type { AccountDTO, PublicProfileDTO } from "./_use-cases";
export {
  createPersonalAccount,
  createOrganizationAccount,
  updateAccountProfile,
  getAccountById,
  getPublicProfile,
} from "./_use-cases";

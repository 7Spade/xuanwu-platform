// account.module — Public API barrel
// Bounded Context: Account / 帳戶
//
// An Account is the application-level representation of a subject (person or organization).
// AccountType: personal | organization
//
// Exports: DTOs, application use cases, port interfaces.
// NEVER export entities, value objects, repositories, or domain events directly.

// DTOs
export type { AccountDTO, PublicProfileDTO } from "./core/_use-cases";

// Application use cases
export {
  createPersonalAccount,
  createOrganizationAccount,
  updateAccountProfile,
  getAccountById,
  getPublicProfile,
  getOrganizationsByOwnerId,
} from "./core/_use-cases";

// Port interfaces (for infrastructure adapter implementors)
export type {
  IAccountRepository,
  IAccountHandleAvailabilityPort,
  IAccountBadgeWritePort,
  IMembershipRepository,
} from "./domain.account/_ports";

// Presentation hook — stable public API for cross-module session access
export { useCurrentAccount } from "./_components/account-provider";
export type { AccountContextValue } from "./_components/account-provider";

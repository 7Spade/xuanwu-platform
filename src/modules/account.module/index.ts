// account.module — Public API barrel
// Bounded Context: Account / 帳戶
//
// An Account is the application-level representation of a subject (person or organization).
// AccountType: personal | organization
//
// Exports: DTOs, application use cases, port interfaces.
// NEVER export entities, value objects, repositories, or domain events directly.

// DTOs
export type { AccountDTO, MemberDTO, PublicProfileDTO } from "./core/_queries";

// Application use cases
export {
  createPersonalAccount,
  createOrganizationAccount,
  updateAccountProfile,
} from "./core/_actions";
export {
  getAccountById,
  getOrgMembersByHandle,
  getPublicProfile,
  getOrganizationsByOwnerId,
  getUserRoleInOrganization,
  type MemberRole,
} from "./core/_queries";

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

// Presentation components (UI surfaces for this bounded context)
export { AccountProvider } from "./_components/account-provider";
export { AccountSwitcher } from "./_components/account-switcher";
export { SecurityView } from "./_components/security-view";
export { UserSettingsView } from "./_components/user-settings-view";

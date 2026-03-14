// identity.module — Public API barrel
// Bounded Context: Identity · Authentication / 身份識別 · 驗證
//
// Identity is the authentication and credential concern for ANY account type.
// It handles sign-in flows, session tokens, identity providers, and auth claims.
//
// Identity is separate from Account:
//   - identity.module: WHO is authenticated (credentials, sessions, claims)
//   - account.module:  WHAT the authenticated subject owns (profile, teams, roles)
//
// Exports: DTOs, application use cases, port interfaces (for adapter implementors).
// NEVER export entities, value objects, repositories, or domain events directly.

// DTOs
export type { IdentityDTO, SessionStatusDTO } from "./core/_use-cases";

// Application use cases (framework-agnostic functions)
export {
  signIn,
  signOut,
  signInAnonymously,
  sendPasswordResetEmail,
  registerIdentity,
  getCurrentIdentity,
  getIdentityById,
} from "./core/_use-cases";

// Port interfaces (for infrastructure adapter implementors)
export type {
  IAuthProviderPort,
  IIdentityRepository,
  IAuthClaimsPort,
  ISessionPort,
} from "./domain.identity/_ports";

// AuthUser DTO (used as the return type of IAuthProviderPort methods)
export type { AuthUser } from "./domain.identity/_value-objects";

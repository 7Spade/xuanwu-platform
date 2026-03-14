// identity.module — Public API barrel
// Bounded Context: Identity · Authentication / 身份識別 · 驗證
// Layer: SaaS (cross-cutting — serves all account types uniformly)
//
// Identity is the authentication and credential concern for ANY account type.
// It handles sign-in flows, session tokens, identity providers, and auth claims.
// It replaces direct Firebase Auth SDK usage across the codebase — all auth
// operations are mediated through this module's Application layer.
//
// Identity is separate from Account:
//   - identity.module: WHO is authenticated (credentials, sessions, claims)
//   - account.module:  WHAT the authenticated subject owns (account entity, settings, profile)
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};

// Identity use cases — authentication and session management
// e.g. RegisterIdentityUseCase      — triggered on first sign-in, creates identity + account
//      SignInUseCase                 — authenticates with a provider, issues session
//      SignOutUseCase                — revokes session
//      RefreshSessionUseCase         — rotates session token
//      LinkIdentityProviderUseCase   — link additional providers (Google, GitHub) to account
//      SetAuthClaimsUseCase          — embed accountId + role into JWT for server-side enforcement

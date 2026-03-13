// Identity port interfaces — implemented by infrastructure adapters
// e.g. IIdentityRepository       — stores identity records linked to accounts
//      IAuthProviderPort         — wraps Firebase Auth SDK for sign-in/sign-out/token ops
//      ISessionPort              — manages session creation, refresh, and revocation
//      IAuthClaimsPort           — reads and writes custom claims on JWT tokens

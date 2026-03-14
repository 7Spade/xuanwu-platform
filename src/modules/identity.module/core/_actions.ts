'use server';
// Identity server actions — thin 'use server' wrappers over application use cases.
// These are the entry points called from React Server Components and form handlers.
// They wire the port interfaces to real infrastructure adapters.
//
// Adapters are injected here so that the use-case layer stays infrastructure-free.
// Replace the placeholder `getAuthAdapter()` calls with real adapter imports
// once the infra.firestore adapter is implemented.

export type { IdentityDTO, SessionStatusDTO } from "./_use-cases";
export {
  signIn,
  signOut,
  signInAnonymously,
  sendPasswordResetEmail,
  registerIdentity,
} from "./_use-cases";

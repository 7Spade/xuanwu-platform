// Identity actions — re-export barrel for application use cases.
// Components import mutation functions from here; all Firebase operations run
// client-side via the Web SDK (repos injected at the call site).

export type { IdentityDTO, SessionStatusDTO } from "./_use-cases";
export {
  signIn,
  signOut,
  signInAnonymously,
  sendPasswordResetEmail,
  registerIdentity,
} from "./_use-cases";

# PR #5 — Hardcode Firebase dev config, reCAPTCHA Enterprise App Check, Realtime Database adapter, /firebase-check status page

**Status**: Merged (2026-03-13)
**Branch**: (merged to main)

## Summary
Wired Firebase project credentials into the infrastructure layer to verify all services operational. Environment variables still take precedence over hardcoded dev defaults.

## Key Changes

### Firebase config (`src/shared-infra/firebase/app.ts`)
- Added `DEV_FIREBASE_CONFIG` with all project values including `databaseURL` for Realtime Database
- Exported `resolvedFirebaseConfig`: env-var override → hardcoded fallback pattern
- Project ID: `xuanwu-i-00708880-4e2d8`

### App Check
- Switched `ReCaptchaV3Provider` → `ReCaptchaEnterpriseProvider`
- Override via `NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_KEY`

### Analytics
- Guard reads `resolvedFirebaseConfig.measurementId` instead of env var directly

### New: Realtime Database adapter
- Adapter in `src/shared-infra/firebase/` for Realtime Database operations

### New: `/firebase-check` status page
- Diagnostic page to verify all Firebase services are operational without UI
- Tests Firestore, Realtime DB, App Check, Analytics connectivity

### firebase-mcp-server integration
- Configured Firebase MCP integration for project inspection

## Architecture note
At this point the project used `src/shared-infra/` (later deleted in PR #6 and replaced by `src/infrastructure/firebase/`).

## Lessons learned
- Zero-config dev defaults (hardcoded fallback) prevent blocking on `.env.local` setup
- `resolvedFirebaseConfig` single source of truth pattern prevents drift between env vars and hardcoded values

/**
 * Firebase App Check adapter.
 *
 * Protects Firebase backend resources from abuse by verifying each request
 * originates from a genuine instance of your app.
 *
 * Providers supported by this adapter:
 *   - reCAPTCHA v3  (default for production web apps)
 *   - Debug token   (development / CI environments)
 *
 * Required environment variables:
 *   NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY   — reCAPTCHA v3 site key
 *   NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN — debug token (dev only)
 *
 * App Check must be initialised BEFORE any other Firebase service call.
 * Call `initAppCheck()` in your root layout or app entry point.
 */

import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from "firebase/app-check";
import { getFirebaseApp } from "./app";

let _appCheck: AppCheck | null = null;

/**
 * Initialises Firebase App Check.
 * Safe to call multiple times — subsequent calls return the existing instance.
 *
 * In development (NODE_ENV !== "production"), the debug token is used when
 * `NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN` is set.
 */
export function initAppCheck(): AppCheck | null {
  if (_appCheck) return _appCheck;
  if (typeof window === "undefined") return null;

  const isDev = process.env.NODE_ENV !== "production";
  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
  const recaptchaKey = process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY;

  if (isDev && debugToken) {
    // Expose the debug token on the window object so the App Check SDK can
    // pick it up automatically in development.
    // See: https://firebase.google.com/docs/app-check/web/debug-provider
    (self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  if (!recaptchaKey) {
    if (!isDev) {
      console.warn(
        "[AppCheck] NEXT_PUBLIC_FIREBASE_RECAPTCHA_SITE_KEY is not set. App Check is disabled.",
      );
    }
    return null;
  }

  _appCheck = initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaV3Provider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  });

  return _appCheck;
}

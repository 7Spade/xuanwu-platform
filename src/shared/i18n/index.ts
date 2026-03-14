import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/shared/constants";
import type { Locale } from "@/shared/types";

// ---------------------------------------------------------------------------
// Translation dictionaries
// ---------------------------------------------------------------------------

type Messages = Record<string, string>;
type Dictionary = Record<Locale, Messages>;

const dictionary: Dictionary = {
  "zh-TW": {
    "home.welcome": "歡迎使用玄武平台",
    "home.started": "啟動時間",
    "common.loading": "載入中…",
    "common.error": "發生錯誤",
    "common.retry": "重試",
    "common.confirm": "確認",
    "common.cancel": "取消",
    "common.save": "儲存",
    "common.delete": "刪除",
    "common.edit": "編輯",
    "error.notFound": "找不到資源",
    "error.unauthorized": "未授權",
    "error.forbidden": "禁止存取",
    "error.validation": "資料驗證失敗",
    "error.conflict": "資源已存在",
    "error.internal": "伺服器內部錯誤",
    "auth.login": "登入",
    "auth.register": "註冊",
    "auth.email": "電子郵件",
    "auth.password": "密碼",
    "auth.contactEndpoint": "連絡終點",
    "auth.securityKey": "安全金鑰",
    "auth.setSecurityKey": "設定安全金鑰",
    "auth.digitalDesignation": "數位稱號",
    "auth.nickname": "暱稱",
    "auth.forgotPassword": "忘記密碼？",
    "auth.enterDimension": "進入維度",
    "auth.registerSovereignty": "建立主權",
    "auth.guestAccess": "以訪客身份進入",
    "auth.byLoggingIn": "登入即代表同意",
    "auth.dimensionSecurityProtocol": "維度安全協議",
    "auth.resetPassword": "重置密碼",
    "auth.sendEmail": "發送郵件",
    "auth.authenticationFailed": "身份驗證失敗",
    "auth.identityResonanceSuccessful": "身份共鳴成功",
    "auth.resetProtocolSent": "重置協議已發送",
    "auth.resetFailed": "重置失敗",
    "auth.pleaseSetDisplayName": "請設定顯示名稱",
    "auth.signOut": "登出",
  },
  en: {
    "home.welcome": "Welcome to Xuanwu Platform",
    "home.started": "Started at",
    "common.loading": "Loading…",
    "common.error": "An error occurred",
    "common.retry": "Retry",
    "common.confirm": "Confirm",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "error.notFound": "Resource not found",
    "error.unauthorized": "Unauthorized",
    "error.forbidden": "Access forbidden",
    "error.validation": "Validation failed",
    "error.conflict": "Resource already exists",
    "error.internal": "Internal server error",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.contactEndpoint": "Contact Endpoint",
    "auth.securityKey": "Security Key",
    "auth.setSecurityKey": "Set Security Key",
    "auth.digitalDesignation": "Digital Designation",
    "auth.nickname": "Nickname",
    "auth.forgotPassword": "Forgot password?",
    "auth.enterDimension": "Enter Dimension",
    "auth.registerSovereignty": "Register Sovereignty",
    "auth.guestAccess": "Enter as Guest",
    "auth.byLoggingIn": "By logging in, you agree to",
    "auth.dimensionSecurityProtocol": "Dimension Security Protocol",
    "auth.resetPassword": "Reset Password",
    "auth.sendEmail": "Send Email",
    "auth.authenticationFailed": "Authentication Failed",
    "auth.identityResonanceSuccessful": "Identity Resonance Successful",
    "auth.resetProtocolSent": "Reset protocol sent",
    "auth.resetFailed": "Reset failed",
    "auth.pleaseSetDisplayName": "Please set a display name",
    "auth.signOut": "Sign Out",
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether a locale string is one of the supported locales.
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Resolve a raw locale string to a supported `Locale`, falling back to the
 * default locale when the requested locale is not supported.
 */
export function resolveLocale(locale?: string | null): Locale {
  if (locale && isSupportedLocale(locale)) return locale;
  return DEFAULT_LOCALE;
}

/**
 * Return a translate function (`t`) bound to the given locale.
 *
 * @example
 * const t = useTranslation("zh-TW");
 * t("home.welcome"); // "歡迎使用玄武平台"
 * t("missing.key");  // "missing.key"  (key fallback)
 */
export function useTranslation(locale?: string | null): (key: string) => string {
  const resolved = resolveLocale(locale);
  const messages = dictionary[resolved];

  return (key: string): string => messages[key] ?? key;
}

/**
 * Retrieve the full message dictionary for a locale.
 * Useful for passing to third-party i18n providers.
 */
export function getMessages(locale?: string | null): Messages {
  return dictionary[resolveLocale(locale)];
}

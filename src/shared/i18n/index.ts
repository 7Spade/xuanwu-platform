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
    "app.name": "玄武平台",
    "nav.home": "首頁",
    "nav.workspaces": "工作空間",
    "nav.account": "帳號",
    "nav.mainMenu": "主選單",
    "nav.profileSettings": "個人設定",
    "nav.breadcrumb.profile": "個人資料",
    "nav.breadcrumb.security": "安全性",
    "nav.breadcrumb.notifications": "通知",
    "nav.breadcrumb.organizations": "組織",
    "nav.breadcrumb.settings": "設定",
    "nav.breadcrumb.members": "成員",
    "nav.breadcrumb.billing": "帳單",
    // --- workspaces ---
    "workspaces.title": "工作空間",
    "workspaces.description": "{name} 的工作空間",
    "workspaces.createSpace": "建立空間",
    "workspaces.createInitialSpace": "建立第一個空間",
    "workspaces.spaceVoid": "虛空中沒有空間",
    "workspaces.noSpacesFound": "找不到符合條件的工作空間",
    "workspaces.searchPlaceholder": "搜尋工作空間…",
    "workspaces.workspaceNodes": "工作節點",
    "workspaces.yourRole": "您的角色",
    "workspaces.personalDimension": "個人維度",
    "workspaces.personalDimensionHelp": "個人帳號不包含組織工作空間",
    // --- profile ---
    "profile.title": "個人資料",
    "profile.subtitle": "管理您的公開個人資料",
    "profile.pageTitle": "帳號設定",
    "profile.pageDescription": "管理您的個人資料與偏好設定",
    "profile.displayName": "顯示名稱",
    "profile.displayNamePlaceholder": "輸入顯示名稱",
    "profile.email": "電子郵件",
    "profile.saveChanges": "儲存變更",
    "profile.saved": "已儲存 ✓",
    // --- onboarding ---
    "onboarding.title": "歡迎使用玄武平台",
    "onboarding.subtitle": "讓我們設定您的帳號",
    "onboarding.step1": "建立個人資料",
    "onboarding.getStarted": "開始使用",
    "onboarding.createOrg": "建立組織",
    "onboarding.skip": "稍後再說",
    // --- common additions ---
    "common.open": "開啟",
    "common.filter": "篩選",
    "common.gridView": "格狀檢視",
    "common.listView": "清單檢視",
    "common.notSet": "未設定",
    "common.saving": "儲存中…",
    "common.back": "返回",
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
    "app.name": "Xuanwu Platform",
    "nav.home": "Home",
    "nav.workspaces": "Workspaces",
    "nav.account": "Account",
    "nav.mainMenu": "Main Menu",
    "nav.profileSettings": "Profile Settings",
    "nav.breadcrumb.profile": "Profile",
    "nav.breadcrumb.security": "Security",
    "nav.breadcrumb.notifications": "Notifications",
    "nav.breadcrumb.organizations": "Organizations",
    "nav.breadcrumb.settings": "Settings",
    "nav.breadcrumb.members": "Members",
    "nav.breadcrumb.billing": "Billing",
    // --- workspaces ---
    "workspaces.title": "Workspaces",
    "workspaces.description": "Workspaces in {name}",
    "workspaces.createSpace": "New Space",
    "workspaces.createInitialSpace": "Create First Space",
    "workspaces.spaceVoid": "No spaces in the void",
    "workspaces.noSpacesFound": "No workspaces match your search",
    "workspaces.searchPlaceholder": "Search workspaces…",
    "workspaces.workspaceNodes": "Workspace Nodes",
    "workspaces.yourRole": "Your Role",
    "workspaces.personalDimension": "Personal Dimension",
    "workspaces.personalDimensionHelp": "Personal accounts do not include organization workspaces",
    // --- profile ---
    "profile.title": "Profile",
    "profile.subtitle": "Manage your public profile",
    "profile.pageTitle": "Account Settings",
    "profile.pageDescription": "Manage your profile and preferences",
    "profile.displayName": "Display Name",
    "profile.displayNamePlaceholder": "Enter display name",
    "profile.email": "Email",
    "profile.saveChanges": "Save Changes",
    "profile.saved": "Saved ✓",
    // --- onboarding ---
    "onboarding.title": "Welcome to Xuanwu Platform",
    "onboarding.subtitle": "Let's set up your account",
    "onboarding.step1": "Create your profile",
    "onboarding.getStarted": "Get Started",
    "onboarding.createOrg": "Create Organization",
    "onboarding.skip": "Maybe later",
    // --- common additions ---
    "common.open": "Open",
    "common.filter": "Filter",
    "common.gridView": "Grid view",
    "common.listView": "List view",
    "common.notSet": "Not set",
    "common.saving": "Saving…",
    "common.back": "Back",
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

export const APP_NAME = "Xuanwu Platform";
export const APP_VERSION = "0.1.0";

/** Default locale used when no locale is explicitly provided. */
export const DEFAULT_LOCALE = "zh-TW";

/** Supported locales for the platform. */
export const SUPPORTED_LOCALES = ["zh-TW", "en"] as const;

/**
 * Reference format tokens (e.g. for dayjs / date-fns).
 * These are NOT used by the built-in `formatDate`/`formatDateTime` helpers,
 * which delegate to the native `Intl` API.
 */
export const DATE_FORMAT = "YYYY-MM-DD";

/** @see DATE_FORMAT */
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

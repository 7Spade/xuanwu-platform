# `src/shared/i18n/`

## Purpose

Manages **multi-language support** for all user-facing strings in the application. The translation dictionary is the single source of truth for locale strings; components must never hardcode UI text.

## Supported locales

| Locale | Language |
|--------|----------|
| `zh-TW` | Traditional Chinese (default) |
| `en` | English |

## Exports

| Export | Description |
|--------|-------------|
| `isSupportedLocale(value)` | Type guard — returns `true` if the string is a valid `Locale` |
| `resolveLocale(value?)` | Returns the locale string if valid, otherwise falls back to `DEFAULT_LOCALE` |
| `useTranslation(locale?)` | Client/server hook — returns a `t(key)` function for the given locale |
| `getMessages(locale)` | Returns the full message dictionary for the given locale (SSR-friendly) |

## Usage

```typescript
// Server Component / Server Action
import { getMessages } from "@/shared/i18n";
const messages = getMessages("zh-TW");

// Any component (server or client)
import { useTranslation } from "@/shared/i18n";
const { t } = useTranslation("zh-TW");
return <h1>{t("home.welcome")}</h1>;
```

## Adding a new string

1. Open `src/shared/i18n/index.ts`.
2. Add the key to **both** the `"zh-TW"` and `"en"` entries inside the `dictionary` object.
3. Use a dot-notation namespace that matches the feature: `workspace.settings.title`, `auth.login`, `common.save`.
4. Re-use existing keys where the meaning is identical across features (e.g. `"common.confirm"`).

## Conventions

- Keys use `camelCase` dot-notation (`feature.subFeature.label`).
- Do not add HTML markup inside translation strings.
- Do not interpolate variables inside the dictionary strings; use a template helper at the call site.
- `directives/index.ts` does not depend on `i18n`; locale resolution is always done at the component boundary.

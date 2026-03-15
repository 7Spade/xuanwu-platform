# `src/shared/constants/`

## Purpose

Stores **global compile-time and runtime constants** that are used across the entire application. All values here must be immutable and free of side effects.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `APP_NAME` | `string` | Display name of the platform (`"Xuanwu Platform"`) |
| `APP_VERSION` | `string` | Current semver string (e.g. `"0.1.0"`) |
| `DEFAULT_LOCALE` | `string` | Fallback locale (`"zh-TW"`) |
| `SUPPORTED_LOCALES` | `readonly string[]` | All locales the UI supports (`["zh-TW", "en"]`) |
| `DATE_FORMAT` | `string` | Date-only format token (`"YYYY-MM-DD"`) for dayjs/date-fns |
| `DATETIME_FORMAT` | `string` | Date+time format token (`"YYYY-MM-DD HH:mm:ss"`) |

## Usage

```typescript
import { APP_NAME, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/shared";
// or directly:
import { APP_NAME } from "@/shared/constants";
```

## Conventions

- Constants are `UPPER_SNAKE_CASE`.
- Do not add environment-variable reads here (use `process.env` directly at call-site or in `src/infrastructure/`).
- Do not add domain-specific constants (e.g. workspace lifecycle states) — those belong in the owning Domain Module's `domain.*/_value-objects.ts`.

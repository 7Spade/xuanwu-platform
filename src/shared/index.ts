// src/shared/index.ts
// Unified named-export barrel for the shared layer.
//
// All shared utilities, types, constants, and errors should be imported
// from this single entry point so that refactors inside sub-modules remain
// transparent to callers and import paths are easy to audit:
//
//   import { AppError, formatDate, PaginatedResponse } from "@/shared"
//
// Sub-modules and what they contribute:
//   constants   — APP_NAME, APP_VERSION, DEFAULT_LOCALE, SUPPORTED_LOCALES, date format tokens
//   errors      — AppError, NotFoundError, UnauthorizedError, ForbiddenError,
//                 ValidationError, ConflictError, toAppError
//   interfaces  — ApiResponse, ApiError, PaginationQuery, PaginatedResult,
//                 FirestoreDocument, VisDateMetadata
//   i18n        — isSupportedLocale, resolveLocale, useTranslation, getMessages
//   pipes       — Pipe, schemaPipe, transformPipe, composePipes, trimPipe
//   ports       — ICachePort, IQueuePort, IVectorIndexPort, IWorkflowPort,
//                 IStoragePort, ILocalePort, ILoggerPort, IAnalyticsPort, IAuthPort
//   types       — NonEmptyString, UuidSchema, IsoDateString, PositiveInt,
//                 PaginationSchema, PaginatedResponseSchema, LocaleSchema,
//                 Locale, Success, Failure, Result, ok, fail
//   utils       — formatDate, formatDateTime, capitalise, toKebabCase,
//                 omit, pick, unique, chunk
//
// NOTE: Client-side React hooks (useToggle, useDebounce, useLocalStorage,
//       usePrevious, useIsMounted, useLocale) are in @/shared/directives.
//       They carry a "use client" directive and must be imported separately
//       from within Client Components only:
//
//   import { useToggle, useDebounce, useLocale } from "@/shared/directives"

export * from './constants';
export * from './errors';
export * from './interfaces';
export * from './i18n';
export * from './pipes';
export * from './ports';
export * from './types';
export * from './utils';

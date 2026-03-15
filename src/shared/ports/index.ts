// src/shared/ports/index.ts
// Anti-Corruption Layer (ACL) — cross-cutting port interfaces.
//
// Port interfaces in this sub-module represent infrastructure abstractions
// that are NOT owned by a single Domain Module. They allow Application-layer
// code to depend on a stable contract rather than on concrete adapters.
//
// Concrete implementations live in src/infrastructure/ or src/shared/directives/:
//   ICachePort         ← implemented by src/infrastructure/upstash/redis.ts
//   IQueuePort         ← implemented by src/infrastructure/upstash/qstash.ts
//   IVectorIndexPort   ← implemented by src/infrastructure/upstash/vector.ts
//   IWorkflowPort      ← implemented by src/infrastructure/upstash/workflow.ts
//   IStoragePort       ← implemented by window.localStorage (via useLocalStorage directive)
//   ILocalePort        ← implemented by useLocale directive (src/shared/directives)
//   ILoggerPort        ← implemented by ConsoleLoggerAdapter / Cloud Logging
//   IAnalyticsPort     ← implemented by Firebase Analytics / Mixpanel adapter
//   IAuthPort          ← implemented by src/infrastructure/firebase/admin/auth
//
// Usage:
//   import type { ICachePort } from "@/shared/ports";
//   // or via the barrel:
//   import type { ICachePort } from "@/shared";

import type { Locale } from "@/shared/types";

// ---------------------------------------------------------------------------
// Cache port (e.g. Redis)
// ---------------------------------------------------------------------------

/** Generic key-value cache with optional TTL. */
export interface ICachePort {
  /** Retrieve a cached value by key. Returns `null` if not found or expired. */
  get<T>(key: string): Promise<T | null>;
  /** Store a value. `ttlSeconds` sets an expiry; omit for persistent storage. */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  /** Remove a cached key. */
  del(key: string): Promise<void>;
  /** Remove all keys matching a glob pattern. */
  delPattern(pattern: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Queue / message port (e.g. QStash)
// ---------------------------------------------------------------------------

/** Publish a message to a destination for asynchronous processing. */
export interface IQueuePort {
  /** Publish a message to the given destination URL. */
  publish(options: {
    destination: string;
    body?: unknown;
    delaySeconds?: number;
    retries?: number;
  }): Promise<{ messageId: string }>;
}

// ---------------------------------------------------------------------------
// Vector index port (e.g. Upstash Vector)
// ---------------------------------------------------------------------------

/** Semantic vector index for similarity search and RAG pipelines. */
export interface IVectorIndexPort<TMetadata = Record<string, unknown>> {
  /** Upsert one or more vectors (create or overwrite by id). */
  upsert(vectors: Array<{
    id: string;
    vector: number[];
    metadata?: TMetadata;
  }>): Promise<void>;
  /** Semantic similarity query. Returns the top-k nearest neighbours. */
  query(options: {
    vector: number[];
    topK: number;
    filter?: string;
    includeMetadata?: boolean;
  }): Promise<Array<{ id: string; score: number; metadata?: TMetadata }>>;
  /** Delete vectors by id. */
  delete(ids: string[]): Promise<void>;
}

// ---------------------------------------------------------------------------
// Workflow port (e.g. Upstash Workflow)
// ---------------------------------------------------------------------------

/** Trigger and query durable multi-step workflows. */
export interface IWorkflowPort {
  /** Trigger a workflow endpoint by URL. Returns a run ID. */
  trigger(options: {
    url: string;
    body?: unknown;
    retries?: number;
  }): Promise<{ workflowRunId: string }>;
  /** Cancel a running workflow by run ID. */
  cancel(workflowRunId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Browser storage port (e.g. localStorage / sessionStorage)
// ---------------------------------------------------------------------------

/**
 * Generic synchronous key-value storage.
 * Concrete implementations: window.localStorage, window.sessionStorage.
 * Used by the `useLocalStorage` directive in `src/shared/directives`.
 */
export interface IStoragePort {
  /** Retrieve a stored value by key. Returns `null` if not found. */
  get<T>(key: string): T | null;
  /** Store a value, serialising it for the underlying storage medium. */
  set<T>(key: string, value: T): void;
  /** Remove a stored key. */
  remove(key: string): void;
  /** Clear all stored keys. */
  clear(): void;
}

// ---------------------------------------------------------------------------
// Locale port
// ---------------------------------------------------------------------------

/**
 * Locale resolution and persistence.
 * Concrete implementation: `useLocale` directive in `src/shared/directives`
 * (reads/writes via `IStoragePort` / `localStorage`).
 * Server-side implementation: cookies or Accept-Language header resolver.
 */
export interface ILocalePort {
  /** Get the currently active locale. Falls back to `DEFAULT_LOCALE`. */
  getLocale(): Locale;
  /** Persist a locale preference so it survives page navigation. */
  setLocale(locale: Locale): void;
  /** Resolve a raw string to a supported `Locale`, falling back to the default. */
  resolveLocale(raw?: string | null): Locale;
}

// ---------------------------------------------------------------------------
// Logger port
// ---------------------------------------------------------------------------

/**
 * Structured application logger.
 * Concrete implementations: ConsoleLoggerAdapter, Google Cloud Logging adapter.
 * Application-layer code depends on this interface rather than on `console.*`.
 */
export interface ILoggerPort {
  /** Diagnostic message useful during development. */
  debug(message: string, context?: Record<string, unknown>): void;
  /** Informational message about normal operations. */
  info(message: string, context?: Record<string, unknown>): void;
  /** Unexpected but recoverable situation. */
  warn(message: string, context?: Record<string, unknown>): void;
  /** Error that may impact functionality. */
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

// ---------------------------------------------------------------------------
// Analytics port
// ---------------------------------------------------------------------------

/**
 * Analytics and event tracking.
 * Concrete implementations: Firebase Analytics adapter, Mixpanel adapter.
 * Keeps tracking calls decoupled from the specific vendor SDK.
 */
export interface IAnalyticsPort {
  /** Track a named user action or conversion event. */
  track(event: string, properties?: Record<string, unknown>): void;
  /** Associate the current session with a known user identity. */
  identify(userId: string, traits?: Record<string, unknown>): void;
  /** Record a page / screen view. */
  page(name?: string, properties?: Record<string, unknown>): void;
}

// ---------------------------------------------------------------------------
// Auth port
// ---------------------------------------------------------------------------

/**
 * Authentication state and token provider.
 * Concrete implementation: Firebase Auth adapter in
 * `src/infrastructure/firebase/admin/auth/`.
 * Application-layer use cases depend on this interface rather than directly
 * on the Firebase Admin or Web SDKs.
 */
export interface IAuthPort {
  /** Return the current user's UID, or `null` if unauthenticated. */
  getCurrentUserId(): Promise<string | null>;
  /**
   * Return a short-lived Firebase ID token for server-side verification.
   * Pass `forceRefresh: true` to bypass the SDK cache.
   */
  getIdToken(forceRefresh?: boolean): Promise<string | null>;
  /** Sign the current user out across all active sessions. */
  signOut(): Promise<void>;
  /** Resolves to `true` when a user is currently signed in. */
  isAuthenticated(): Promise<boolean>;
}

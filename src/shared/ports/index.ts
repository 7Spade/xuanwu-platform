// src/shared/ports/index.ts
// Anti-Corruption Layer (ACL) — cross-cutting port interfaces.
//
// Port interfaces in this sub-module represent infrastructure abstractions
// that are NOT owned by a single Domain Module. They allow Application-layer
// code to depend on a stable contract rather than on concrete adapters.
//
// Concrete implementations live in src/infrastructure/:
//   ICachePort         ← implemented by src/infrastructure/upstash/redis.ts
//   IQueuePort         ← implemented by src/infrastructure/upstash/qstash.ts
//   IVectorIndexPort   ← implemented by src/infrastructure/upstash/vector.ts
//   IWorkflowPort      ← implemented by src/infrastructure/upstash/workflow.ts
//
// Usage:
//   import type { ICachePort } from "@/shared/ports";
//   // or via the barrel:
//   import type { ICachePort } from "@/shared";

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

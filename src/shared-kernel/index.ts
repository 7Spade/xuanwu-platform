/**
 * Shared Kernel public API
 *
 * Exports cross-cutting domain contracts that any bounded context can import.
 * Keep this lean — only add here what is genuinely shared across multiple slices.
 */

export * from "./ports";
export * from "./value-objects";
export * from "./data-contracts";

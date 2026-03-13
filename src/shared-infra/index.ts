/**
 * Shared infrastructure public API.
 *
 * Only export concrete adapters that have been reviewed and are safe for
 * cross-slice use. Feature-specific adapters should stay in their own infra
 * directories.
 */

export * from "./firebase";

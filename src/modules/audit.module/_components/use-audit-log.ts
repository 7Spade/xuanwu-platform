"use client";
/**
 * useAuditLog — client-side hook that fetches audit log entries.
 *
 * Source equivalent: workspace.slice/gov.audit/_hooks/use-account-audit.ts
 *                    workspace.slice/gov.audit/_hooks/use-workspace-audit.ts
 * Adapted: uses FirestoreAuditRepository (Web SDK) + getAuditLogByResource /
 * getAuditLogByWorkspace use-cases. Normalises AuditEntryDTO to a UI-ready
 * AuditDisplayEntry shape that mirrors the source's AuditLog type.
 */

import { useEffect, useMemo, useState } from "react";
import { FirestoreAuditRepository } from "../infra.firestore/_repository";
import {
  getAuditLogByResource,
  getAuditLogByWorkspace,
  type AuditEntryDTO,
} from "../core/_use-cases";

// ---------------------------------------------------------------------------
// Display type — normalised for presentation
// ---------------------------------------------------------------------------

export type AuditEntryType = "create" | "update" | "delete" | "security";

export interface AuditDisplayEntry {
  readonly id: string;
  /** Human-readable actor label (handle or fallback). */
  readonly actor: string;
  /** Human-readable action verb. */
  readonly action: string;
  /** Human-readable target (resource type + short id). */
  readonly target: string;
  /** Colour category for icon selection. */
  readonly type: AuditEntryType;
  /** ISO-8601 timestamp string. */
  readonly occurredAt: string;
  /** Original workspace ID when available. */
  readonly workspaceId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Number of trailing characters to show when displaying a truncated ID. */
const ID_DISPLAY_LENGTH = 8;

function actionToType(action: AuditEntryDTO["action"]): AuditEntryType {
  if (action === "created") return "create";
  if (action === "deleted") return "delete";
  if (
    action === "signed-in" ||
    action === "signed-out" ||
    action === "access-granted" ||
    action === "access-revoked" ||
    action === "role-changed" ||
    action === "policy-changed"
  )
    return "security";
  return "update";
}

function dtoToDisplay(dto: AuditEntryDTO): AuditDisplayEntry {
  return {
    id: dto.id,
    actor: dto.actorAccountHandle ?? dto.actorAccountId.slice(-ID_DISPLAY_LENGTH),
    action: dto.action,
    target: `${dto.resourceType} · ${dto.resourceId.slice(-ID_DISPLAY_LENGTH)}`,
    type: actionToType(dto.action),
    occurredAt: dto.occurredAt,
    workspaceId: dto.workspaceId,
  };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export interface UseAuditLogResult {
  entries: AuditDisplayEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches audit log entries scoped to a single workspace.
 * Pass undefined/null to skip fetching until the workspaceId is resolved.
 */
export function useWorkspaceAuditLog(
  workspaceId: string | null | undefined,
  limit = 50,
): UseAuditLogResult {
  const [entries, setEntries] = useState<AuditDisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const repo = useMemo(() => new FirestoreAuditRepository(), []);

  useEffect(() => {
    if (!workspaceId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getAuditLogByWorkspace(repo, workspaceId, limit)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setEntries(result.value.map(dtoToDisplay));
        } else {
          setError(result.error?.message ?? "Failed to load audit log");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, limit, repo, tick]);

  const refresh = () => setTick((n) => n + 1);

  return { entries, loading, error, refresh };
}

/**
 * Fetches audit log entries scoped to a specific resource (e.g., an account).
 * Pass undefined/null to skip fetching until the resourceId is resolved.
 */
export function useResourceAuditLog(
  resourceId: string | null | undefined,
  limit = 50,
): UseAuditLogResult {
  const [entries, setEntries] = useState<AuditDisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const repo = useMemo(() => new FirestoreAuditRepository(), []);

  useEffect(() => {
    if (!resourceId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getAuditLogByResource(repo, resourceId, limit)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setEntries(result.value.map(dtoToDisplay));
        } else {
          setError(result.error?.message ?? "Failed to load audit log");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resourceId, limit, repo, tick]);

  const refresh = () => setTick((n) => n + 1);

  return { entries, loading, error, refresh };
}

/**
 * Settlement mapper — Firestore document ↔ SettlementRecord transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { SettlementRecord, ClaimLineItem } from "../domain.settlement/_entity";
import type {
  SettlementId,
  FinanceLifecycleStage,
  SettlementRole,
} from "../domain.settlement/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore sub-document for a single claim line item. */
export interface ClaimLineItemDoc {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

/** Raw Firestore document shape for a SettlementRecord. */
export interface SettlementDoc {
  id: string;
  workspaceId: string;
  dimensionId: string;
  role: string;
  stage: string;
  cycleIndex: number;
  contractAmount: number;
  receivedAmount: number;
  currentClaimLineItems: ClaimLineItemDoc[];
  paymentTermStartAt: string | null;
  paymentReceivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

function lineItemDocToEntity(d: ClaimLineItemDoc): ClaimLineItem {
  return {
    itemId: d.itemId,
    name: d.name,
    quantity: d.quantity,
    unitPrice: d.unitPrice,
    lineAmount: d.lineAmount,
  };
}

/**
 * Maps a raw Firestore SettlementDoc to a typed SettlementRecord.
 */
export function settlementDocToEntity(d: SettlementDoc): SettlementRecord {
  return {
    id: d.id as SettlementId,
    workspaceId: d.workspaceId,
    dimensionId: d.dimensionId,
    role: d.role as SettlementRole,
    stage: d.stage as FinanceLifecycleStage,
    cycleIndex: d.cycleIndex,
    contractAmount: d.contractAmount,
    receivedAmount: d.receivedAmount,
    currentClaimLineItems: (d.currentClaimLineItems ?? []).map(lineItemDocToEntity),
    paymentTermStartAt: d.paymentTermStartAt,
    paymentReceivedAt: d.paymentReceivedAt,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

function lineItemEntityToDoc(e: ClaimLineItem): ClaimLineItemDoc {
  return {
    itemId: e.itemId,
    name: e.name,
    quantity: e.quantity,
    unitPrice: e.unitPrice,
    lineAmount: e.lineAmount,
  };
}

/**
 * Maps a SettlementRecord to a plain object suitable for Firestore write.
 */
export function settlementEntityToDoc(e: SettlementRecord): SettlementDoc {
  return {
    id: e.id,
    workspaceId: e.workspaceId,
    dimensionId: e.dimensionId,
    role: e.role,
    stage: e.stage,
    cycleIndex: e.cycleIndex,
    contractAmount: e.contractAmount,
    receivedAmount: e.receivedAmount,
    currentClaimLineItems: [...e.currentClaimLineItems].map(lineItemEntityToDoc),
    paymentTermStartAt: e.paymentTermStartAt,
    paymentReceivedAt: e.paymentReceivedAt,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

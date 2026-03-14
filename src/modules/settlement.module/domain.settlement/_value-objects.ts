import { z } from "zod";

// ---------------------------------------------------------------------------
// SettlementId
// ---------------------------------------------------------------------------

export const SettlementIdSchema = z.string().min(1, "SettlementId must not be empty");
export type SettlementId = z.infer<typeof SettlementIdSchema>;

// ---------------------------------------------------------------------------
// FinanceLifecycleStage
// ---------------------------------------------------------------------------

/**
 * Settlement finance lifecycle state machine.
 * Stages flow forward only (no backward transitions).
 */
export const FinanceLifecycleStageSchema = z.enum([
  "claim-preparation",
  "claim-submitted",
  "claim-approved",
  "invoice-requested",
  "payment-term",
  "payment-received",
  "completed",
]);
export type FinanceLifecycleStage = z.infer<typeof FinanceLifecycleStageSchema>;

// ---------------------------------------------------------------------------
// SettlementRole
// ---------------------------------------------------------------------------

/** Indicates whether this settlement record represents AR or AP. */
export const SettlementRoleSchema = z.enum(["accounts-receivable", "accounts-payable"]);
export type SettlementRole = z.infer<typeof SettlementRoleSchema>;

// ---------------------------------------------------------------------------
// InvoiceAmount
// ---------------------------------------------------------------------------

export const InvoiceAmountSchema = z.number().nonnegative("Amount must be non-negative");
export type InvoiceAmount = z.infer<typeof InvoiceAmountSchema>;

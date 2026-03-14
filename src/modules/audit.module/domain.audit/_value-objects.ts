import { z } from "zod";

export const AuditEntryIdSchema = z.string().min(1);
export type AuditEntryId = z.infer<typeof AuditEntryIdSchema>;

export const AuditActionSchema = z.enum([
  "created", "updated", "deleted",
  "approved", "rejected", "submitted",
  "signed-in", "signed-out",
  "access-granted", "access-revoked",
  "role-changed", "policy-changed",
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const PolicyOutcomeSchema = z.enum(["pass", "fail", "blocked"]);
export type PolicyOutcome = z.infer<typeof PolicyOutcomeSchema>;

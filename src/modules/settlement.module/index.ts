// settlement.module — Public API barrel
// Bounded Context: Settlement · AR · AP / 結算管理
export type { SettlementDTO } from "./core/_use-cases";
export {
  createSettlementRecord,
  submitClaim,
  approveClaim,
  recordPayment,
  getSettlementsByWorkspace,
} from "./core/_use-cases";
export type { ISettlementRepository } from "./domain.settlement/_ports";

// workforce.module — Public API barrel
// Bounded Context: Workforce Scheduling / 排班管理
export type { ScheduleDTO } from "./core/_use-cases";
export {
  proposeSchedule,
  approveSchedule,
  rejectSchedule,
  getSchedulesByWorkspace,
  getSchedulesByAssignee,
} from "./core/_use-cases";
export type { IScheduleRepository, IEligibilityCheckPort } from "./domain.workforce/_ports";

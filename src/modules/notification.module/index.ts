// notification.module — Public API barrel
// Bounded Context: Notification Engine
export type { NotificationDTO } from "./core/_use-cases";
export { sendNotification, markNotificationRead, getNotificationsByAccount } from "./core/_use-cases";
export type { INotificationRepository, INotificationDeliveryPort } from "./domain.notification/_ports";

import { z } from "zod";

export const NotificationIdSchema = z.string().min(1);
export type NotificationId = z.infer<typeof NotificationIdSchema>;

export const NotificationChannelSchema = z.enum(["inbox", "email", "push"]);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

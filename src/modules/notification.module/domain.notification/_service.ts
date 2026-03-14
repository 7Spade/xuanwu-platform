// Notification domain services — logic spanning multiple notification aggregates
// e.g. NotificationDispatchService       (fan-out a single event to multiple channels in priority order)
//      NotificationDeduplicationService  (suppress repeated notifications within a dedup window)

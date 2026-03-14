// Notification domain services.
// NotificationDispatchService — fans out a single event to multiple channels
//   in priority order, deduplicating within a configurable time window.
// NotificationDeduplicationService — suppresses repeated notifications for the
//   same event+recipient pair within a rolling dedup window (e.g. 15 minutes).

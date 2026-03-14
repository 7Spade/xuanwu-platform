// Audit domain events — published to the Event Bus
// e.g. PolicyViolationDetected (→ notification.module: notify workspace owner)
// Note: audit.module primarily CONSUMES events from other modules; most entries are created
// via IAuditEventSubscriber, not as a result of Application layer use cases.

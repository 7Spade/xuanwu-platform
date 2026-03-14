// Audit port interfaces — implemented by infrastructure adapters
// e.g. IAuditEntryRepository     — append-only write and indexed read for audit entries
//      IPolicyRuleRepository     — CRUD for policy rule definitions
//      IAuditEventSubscriber     — subscribes to domain events from all source modules

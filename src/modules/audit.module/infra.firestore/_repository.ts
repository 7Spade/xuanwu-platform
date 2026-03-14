// Audit Firestore repository — implements IAuditEntryRepository and IPolicyRuleRepository
// AuditEntries are stored in an append-only subcollection.
// Firestore security rules must prevent update/delete on audit entry documents.

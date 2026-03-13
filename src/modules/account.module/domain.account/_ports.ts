// Account port interfaces — implemented by infrastructure adapters
// e.g. IAccountRepository              — CRUD for account records
//      IAccountHandleAvailabilityPort  — check handle uniqueness across all account types
//      IAccountBadgeWritePort          — port for achievement.module to write badge unlocks
//      IAccountSocialReadPort          — port for social.module to read public profile data
//      ITeamRepository                 — CRUD for Team sub-aggregates (org accounts only)
//      IMembershipRepository           — invitation, role-assignment, and revocation records

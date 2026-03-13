// profile.module — Public API barrel
// Bounded Context: User Profile / 使用者檔案
// Layer: SaaS (cross-cutting — aggregates data written by social.module and achievement.module)
//
// User Profile is a cross-cutting read/write surface that multiple modules project into:
//   - achievement.module  writes: unlock and render badge → profile.module via IProfileBadgeWritePort
//   - social.module       reads: profile data in social graph context
//   - Section H header spans User->>Profile, indicating profile is part of the social/discovery layer
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};

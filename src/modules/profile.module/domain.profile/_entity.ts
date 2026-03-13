// UserProfile aggregate root — the public-facing identity surface of a user
// Aggregates data projected from other bounded contexts:
//   - Badges and achievements (from achievement.module)
//   - Social signals: follower count, following count, starred workspaces (from social.module)
//   - Contribution activity (from workspace.module)
// Invariants:
//   - A profile is always associated with exactly one User identity.
//   - Profile data is eventually consistent — updated via domain events from other modules.

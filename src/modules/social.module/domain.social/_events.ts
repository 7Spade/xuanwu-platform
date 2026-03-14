// social.module / domain.social / _events.ts
export interface WorkspaceStarred { readonly type: "social:workspace:starred"; readonly accountId: string; readonly workspaceId: string; readonly occurredAt: string; }
export interface UserFollowed { readonly type: "social:user:followed"; readonly subjectAccountId: string; readonly targetAccountId: string; readonly occurredAt: string; }
export type SocialDomainEventUnion = WorkspaceStarred | UserFollowed;

// social.module — Public API barrel
// Bounded Context: Social Graph · Star/Watch/Follow/Like/Bookmark
export type { SocialRelationDTO } from "./core/_use-cases";
export {
  addRelation,
  removeRelation,
  getRelationsBySubject,
  toggleReaction,
  getReactionState,
} from "./core/_use-cases";
export type { ISocialGraphRepository } from "./domain.social/_ports";
export type { SocialRelationType, SocialTargetType } from "./domain.social/_value-objects";
export { SocialActionsBar } from "./_components/social-actions-bar";
export { SocialFeedView } from "./_components/social-feed-view";
export { SocialExploreView } from "./_components/social-explore-view";
export { FollowersPanel } from "./_components/followers-panel";

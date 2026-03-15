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

// social.module — Public API barrel
// Bounded Context: Social Graph · Star/Watch/Follow
export type { SocialRelationDTO } from "./core/_use-cases";
export { addRelation, removeRelation, getRelationsBySubject } from "./core/_use-cases";
export type { ISocialGraphRepository } from "./domain.social/_ports";

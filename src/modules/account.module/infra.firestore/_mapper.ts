/**
 * Account mapper — Firestore document ↔ AccountEntity transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { AccountEntity, AccountProfile, MembershipRecord, TeamRecord } from "../domain.account/_entity";
import type { AccountId, AccountHandle, AccountType, MemberRole, MembershipStatus, TeamId } from "../domain.account/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for an Account. */
export interface AccountDoc {
  id: string;
  handle: string | null;
  accountType: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  badgeSlugs: string[];
  ownerId: string | null;
  members: MembershipDoc[] | null;
  teams: TeamDoc[] | null;
  createdAt: string;
  updatedAt: string;
}

/** Raw Firestore sub-document shape for a Membership. */
export interface MembershipDoc {
  id: string;
  accountId: string;
  role: string;
  status: string;
  invitedAt: string;
  acceptedAt: string | null;
}

/** Raw Firestore sub-document shape for a Team. */
export interface TeamDoc {
  id: string;
  name: string;
  description: string;
  type: string;
  memberIds: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

function membershipDocToRecord(doc: MembershipDoc): MembershipRecord {
  return {
    id: doc.id,
    accountId: doc.accountId as AccountId,
    role: doc.role as MemberRole,
    status: doc.status as MembershipStatus,
    invitedAt: doc.invitedAt,
    acceptedAt: doc.acceptedAt,
  };
}

function teamDocToRecord(doc: TeamDoc): TeamRecord {
  return {
    id: doc.id as TeamId,
    name: doc.name,
    description: doc.description,
    type: doc.type as "internal" | "external",
    memberIds: doc.memberIds as AccountId[],
    createdAt: doc.createdAt,
  };
}

/**
 * Maps a raw Firestore AccountDoc to a typed AccountEntity.
 * Throws if required fields are missing.
 */
export function accountDocToEntity(doc: AccountDoc): AccountEntity {
  const profile: AccountProfile = {
    displayName: doc.displayName,
    avatarUrl: doc.avatarUrl,
    bio: doc.bio,
    badgeSlugs: doc.badgeSlugs ?? [],
  };

  return {
    id: doc.id as AccountId,
    handle: (doc.handle ?? null) as AccountHandle | null,
    accountType: doc.accountType as AccountType,
    profile,
    ownerId: (doc.ownerId ?? null) as AccountId | null,
    members: doc.members ? doc.members.map(membershipDocToRecord) : null,
    teams: doc.teams ? doc.teams.map(teamDocToRecord) : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

function membershipRecordToDoc(rec: MembershipRecord): MembershipDoc {
  return {
    id: rec.id,
    accountId: rec.accountId,
    role: rec.role,
    status: rec.status,
    invitedAt: rec.invitedAt,
    acceptedAt: rec.acceptedAt,
  };
}

function teamRecordToDoc(rec: TeamRecord): TeamDoc {
  return {
    id: rec.id,
    name: rec.name,
    description: rec.description,
    type: rec.type,
    memberIds: [...rec.memberIds],
    createdAt: rec.createdAt,
  };
}

/**
 * Maps an AccountEntity to a raw Firestore AccountDoc ready for write.
 */
export function accountEntityToDoc(entity: AccountEntity): AccountDoc {
  return {
    id: entity.id,
    handle: entity.handle,
    accountType: entity.accountType,
    displayName: entity.profile.displayName,
    avatarUrl: entity.profile.avatarUrl,
    bio: entity.profile.bio,
    badgeSlugs: [...entity.profile.badgeSlugs],
    ownerId: entity.ownerId,
    members: entity.members ? entity.members.map(membershipRecordToDoc) : null,
    teams: entity.teams ? entity.teams.map(teamRecordToDoc) : null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

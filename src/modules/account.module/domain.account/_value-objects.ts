import { z } from "zod";
import { NonEmptyString } from "@/shared";

// ---------------------------------------------------------------------------
// AccountId
// ---------------------------------------------------------------------------

/** Opaque unique identifier for an Account (equals the owner's IdentityId). */
export const AccountIdSchema = z.string().min(1, "AccountId must not be empty");
export type AccountId = z.infer<typeof AccountIdSchema>;

// ---------------------------------------------------------------------------
// AccountType
// ---------------------------------------------------------------------------

export const AccountTypeSchema = z.enum(["personal", "organization"]);
export type AccountType = z.infer<typeof AccountTypeSchema>;

// ---------------------------------------------------------------------------
// AccountHandle
// ---------------------------------------------------------------------------

/**
 * Globally unique slug for an account (@ mention handle).
 * Invariant: a handle is always kept in sync with the namespace.module slug.
 * Rules: lowercase alphanumeric + hyphens, 3–39 characters.
 */
export const AccountHandleSchema = z
  .string()
  .min(3, "Handle must be at least 3 characters")
  .max(39, "Handle must be at most 39 characters")
  .regex(/^[a-z0-9-]+$/, "Handle may only contain lowercase letters, digits, and hyphens");
export type AccountHandle = z.infer<typeof AccountHandleSchema>;

// ---------------------------------------------------------------------------
// DisplayName
// ---------------------------------------------------------------------------

export const DisplayNameSchema = NonEmptyString.max(100, "Display name must be at most 100 characters");
export type DisplayName = z.infer<typeof DisplayNameSchema>;

// ---------------------------------------------------------------------------
// AvatarUrl
// ---------------------------------------------------------------------------

export const AvatarUrlSchema = z.string().url("AvatarUrl must be a valid URL");
export type AvatarUrl = z.infer<typeof AvatarUrlSchema>;

// ---------------------------------------------------------------------------
// MemberRole
// ---------------------------------------------------------------------------

/**
 * Role of a member within an organization account.
 * owner > admin > member > viewer
 */
export const MemberRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

// ---------------------------------------------------------------------------
// MembershipStatus
// ---------------------------------------------------------------------------

export const MembershipStatusSchema = z.enum(["pending", "active", "revoked", "suspended"]);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

// ---------------------------------------------------------------------------
// TeamId / TeamName
// ---------------------------------------------------------------------------

export const TeamIdSchema = z.string().min(1, "TeamId must not be empty");
export type TeamId = z.infer<typeof TeamIdSchema>;

export const TeamNameSchema = NonEmptyString.max(80, "Team name must be at most 80 characters");
export type TeamName = z.infer<typeof TeamNameSchema>;

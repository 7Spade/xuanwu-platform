import { z } from "zod";

// ---------------------------------------------------------------------------
// EmailAddress value object
// ---------------------------------------------------------------------------

const EmailAddressSchema = z.string().email("Invalid email address").toLowerCase();
export type EmailAddress = z.infer<typeof EmailAddressSchema>;

export function createEmailAddress(raw: string): EmailAddress {
  return EmailAddressSchema.parse(raw);
}

// ---------------------------------------------------------------------------
// Url value object
// ---------------------------------------------------------------------------

const UrlSchema = z.string().url("Invalid URL");
export type Url = z.infer<typeof UrlSchema>;

export function createUrl(raw: string): Url {
  return UrlSchema.parse(raw);
}

// ---------------------------------------------------------------------------
// NonEmptyString value object
// ---------------------------------------------------------------------------

const NonEmptyStringSchema = z.string().min(1, "Value must not be empty").trim();
export type NonEmptyString = z.infer<typeof NonEmptyStringSchema>;

export function createNonEmptyString(raw: string): NonEmptyString {
  return NonEmptyStringSchema.parse(raw);
}

// ---------------------------------------------------------------------------
// UniqueId value object (UUID v4)
// ---------------------------------------------------------------------------

const UniqueIdSchema = z.string().uuid("Invalid UUID");
export type UniqueId = z.infer<typeof UniqueIdSchema>;

export function createUniqueId(raw: string): UniqueId {
  return UniqueIdSchema.parse(raw);
}

// ---------------------------------------------------------------------------
// Timestamp value object (ISO-8601)
// ---------------------------------------------------------------------------

const TimestampSchema = z.string().datetime({ message: "Invalid timestamp" });
export type Timestamp = z.infer<typeof TimestampSchema>;

export function createTimestamp(date: Date = new Date()): Timestamp {
  return TimestampSchema.parse(date.toISOString());
}

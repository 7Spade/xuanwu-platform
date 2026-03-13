import { z } from "zod";
import { SUPPORTED_LOCALES } from "@/shared/constants";

// ---------------------------------------------------------------------------
// Primitive value objects
// ---------------------------------------------------------------------------

/** Non-empty string. */
export const NonEmptyString = z.string().min(1, "Value must not be empty");

/** UUID v4. */
export const UuidSchema = z.string().uuid("Invalid UUID");

/** ISO-8601 date string. */
export const IsoDateString = z.string().datetime({ message: "Invalid ISO-8601 date" });

/** Positive integer. */
export const PositiveInt = z.number().int().positive();

/** Pagination query. */
export const PaginationSchema = z.object({
  page: PositiveInt.default(1),
  pageSize: PositiveInt.max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/** Paginated response wrapper. */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: PositiveInt,
    pageSize: PositiveInt,
  });

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------

export const LocaleSchema = z.enum(SUPPORTED_LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;

// ---------------------------------------------------------------------------
// Generic result type (success / failure)
// ---------------------------------------------------------------------------

export type Success<T> = { ok: true; value: T };
export type Failure<E = Error> = { ok: false; error: E };
export type Result<T, E = Error> = Success<T> | Failure<E>;

export function ok<T>(value: T): Success<T> {
  return { ok: true, value };
}

export function fail<E = Error>(error: E): Failure<E> {
  return { ok: false, error };
}

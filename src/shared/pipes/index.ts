import type { z } from "zod";
import { ValidationError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { ok, fail } from "@/shared/types";

// ---------------------------------------------------------------------------
// Pipe type
// ---------------------------------------------------------------------------

/** A pure transformation function from I to O. */
export type Pipe<I, O> = (input: I) => O;

// ---------------------------------------------------------------------------
// Schema pipe — parse + validate with Zod
// ---------------------------------------------------------------------------

/**
 * Create a pipe that parses raw data through a Zod schema.
 * Returns a `Result` so callers can handle errors without try/catch.
 *
 * @example
 * const parseUser = schemaPipe(UserSchema);
 * const result = parseUser(rawData);
 * if (result.ok) console.log(result.value);
 */
export function schemaPipe<T extends z.ZodTypeAny>(
  schema: T,
): Pipe<unknown, Result<z.infer<T>, ValidationError>> {
  return (input) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".") || "_root";
        (fields[path] ??= []).push(issue.message);
      }
      return fail(new ValidationError(parsed.error.message, fields));
    }
    return ok(parsed.data as z.infer<T>);
  };
}

// ---------------------------------------------------------------------------
// Transform pipe — map over a value
// ---------------------------------------------------------------------------

/**
 * Compose two pipes left-to-right: A → B → C.
 *
 * @example
 * const trim = transformPipe((s: string) => s.trim());
 * const upper = transformPipe((s: string) => s.toUpperCase());
 * const trimUpper = composePipes(trim, upper);
 */
export function transformPipe<I, O>(fn: (input: I) => O): Pipe<I, O> {
  return fn;
}

/** Compose two pipes left-to-right. */
export function composePipes<A, B, C>(
  first: Pipe<A, B>,
  second: Pipe<B, C>,
): Pipe<A, C> {
  return (input) => second(first(input));
}

// ---------------------------------------------------------------------------
// Trim pipe — strip leading/trailing whitespace from string fields
// ---------------------------------------------------------------------------

/**
 * Recursively strip whitespace from every string value in a plain object.
 *
 * @example
 * trimPipe({ name: "  Alice  ", age: 30 }) // { name: "Alice", age: 30 }
 */
export function trimPipe<T extends Record<string, unknown>>(input: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    result[key] = typeof value === "string" ? value.trim() : value;
  }
  return result as T;
}

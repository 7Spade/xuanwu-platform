// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Format a Date object into a locale-aware date string.
 *
 * @example
 * formatDate(new Date("2024-01-15")) // "2024-01-15"
 */
export function formatDate(date: Date, locale = "zh-TW"): string {
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Format a Date object into a locale-aware date-time string.
 */
export function formatDateTime(date: Date, locale = "zh-TW"): string {
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/**
 * Capitalise the first letter of a string.
 *
 * @example
 * capitalise("hello") // "Hello"
 */
export function capitalise(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a camelCase or PascalCase string to kebab-case.
 *
 * @example
 * toKebabCase("helloWorld") // "hello-world"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Object helpers
// ---------------------------------------------------------------------------

/**
 * Omit specified keys from an object.
 *
 * @example
 * omit({ a: 1, b: 2, c: 3 }, ["b"]) // { a: 1, c: 3 }
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

/**
 * Pick specified keys from an object.
 *
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ["a", "c"]) // { a: 1, c: 3 }
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Array helpers
// ---------------------------------------------------------------------------

/**
 * Remove duplicate items from an array using strict equality.
 *
 * @example
 * unique([1, 2, 2, 3]) // [1, 2, 3]
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Chunk an array into sub-arrays of the given size.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size < 1) throw new RangeError("Chunk size must be at least 1");
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

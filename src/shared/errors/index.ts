// ---------------------------------------------------------------------------
// Base application error
// ---------------------------------------------------------------------------

/**
 * Base class for all application-level errors.
 * Adds a machine-readable `code` and optional HTTP `statusCode`.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = "INTERNAL_ERROR", statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;

    // Restore prototype chain (required when extending built-ins in TS).
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Domain errors
// ---------------------------------------------------------------------------

/** Thrown when a requested resource cannot be found. */
export class NotFoundError extends AppError {
  constructor(resource = "Resource", id?: string | number) {
    const detail = id !== undefined ? ` (id: ${id})` : "";
    super(`${resource}${detail} not found`, "NOT_FOUND", 404);
  }
}

/** Thrown when the caller is not authenticated. */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

/** Thrown when the caller does not have permission to perform the action. */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

/** Thrown when input validation fails. */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]>;

  constructor(message = "Validation failed", fields?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 422);
    this.fields = fields;
  }
}

/** Thrown when a conflicting resource already exists. */
export class ConflictError extends AppError {
  constructor(resource = "Resource", detail?: string) {
    const extra = detail ? `: ${detail}` : "";
    super(`${resource} already exists${extra}`, "CONFLICT", 409);
  }
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Narrow an unknown thrown value to AppError or re-wrap as AppError. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) return new AppError(err.message);
  return new AppError(String(err));
}

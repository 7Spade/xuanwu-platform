import { z } from "zod";

// ---------------------------------------------------------------------------
// Common response envelope
// ---------------------------------------------------------------------------

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    ok: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });

export const ApiErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.array(z.string())).optional(),
  }),
});

export type ApiSuccessResponse<T> = { ok: true; data: T; message?: string };
export type ApiErrorResponse = {
  ok: false;
  error: { code: string; message: string; fields?: Record<string, string[]> };
};
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Pagination contract
// ---------------------------------------------------------------------------

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Audit fields (shared across aggregates)
// ---------------------------------------------------------------------------

export type AuditFields = {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

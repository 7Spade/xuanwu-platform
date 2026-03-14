import { z } from "zod";

export const FileIdSchema = z.string().min(1);
export type FileId = z.infer<typeof FileIdSchema>;

export const FileVersionIdSchema = z.string().min(1);
export type FileVersionId = z.infer<typeof FileVersionIdSchema>;

export const ParseStatusSchema = z.enum(["pending", "processing", "success", "failed"]);
export type ParseStatus = z.infer<typeof ParseStatusSchema>;

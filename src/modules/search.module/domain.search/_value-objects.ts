import { z } from "zod";

export const SearchIndexIdSchema = z.string().min(1);
export type SearchIndexId = z.infer<typeof SearchIndexIdSchema>;

export const SearchScopeSchema = z.enum(["global", "namespace", "workspace"]);
export type SearchScope = z.infer<typeof SearchScopeSchema>;

export const IndexEntryVisibilitySchema = z.enum(["public", "account-private", "workspace-private"]);
export type IndexEntryVisibility = z.infer<typeof IndexEntryVisibilitySchema>;

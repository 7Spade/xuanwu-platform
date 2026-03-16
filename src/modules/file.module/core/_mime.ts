/**
 * file.module — presentation-safe MIME grouping helpers.
 *
 * Keeps UI concerns on the application-facing side so presentation code
 * does not need to import domain internals directly.
 */

export { getMimeGroup as getFileMimeGroup } from "../domain.file/_service";
export type { MimeGroup as FileMimeGroup } from "../domain.file/_service";

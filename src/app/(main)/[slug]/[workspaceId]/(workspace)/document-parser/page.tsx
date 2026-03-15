import { redirect } from "next/navigation";

/**
 * /document-parser redirects to the standalone /editor route.
 * The capability id is "document-parser" but the editor lives at the standalone path.
 */
export default async function WorkspaceDocumentParserPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { slug, workspaceId } = await params;
  redirect(`/${slug}/${workspaceId}/editor`);
}

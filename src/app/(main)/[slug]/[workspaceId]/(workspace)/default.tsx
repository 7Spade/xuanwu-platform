import { redirect } from "next/navigation";

/**
 * WorkspaceDefault — when a user lands on /${slug}/${workspaceId} with no
 * sub-path, send them to the primary WBS (tasks) tab.
 *
 * Source equivalent: workspace.slice layout redirects to the first capability.
 */
export default async function WorkspaceDefault({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { slug, workspaceId } = await params;
  redirect(`/${slug}/${workspaceId}/wbs`);
}

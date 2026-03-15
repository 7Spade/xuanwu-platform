import { redirect } from "next/navigation";

/**
 * /tasks redirects to /wbs — the capability id is "tasks" but the route is "wbs".
 * This ensures any link to /tasks still works correctly.
 */
export default async function WorkspaceTasksPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { slug, workspaceId } = await params;
  redirect(`/${slug}/${workspaceId}/wbs`);
}

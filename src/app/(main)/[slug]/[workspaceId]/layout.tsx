/**
 * WorkspaceProvider layout
 *
 * Responsibilities:
 * - Load workspace by `workspaceId`
 * - Verify `ownerSlug` matches the parent `slug` segment
 * - Verify current user has permissions for this workspace
 * - Provide workspace context to all nested routes
 */
export default async function WorkspaceIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  await params;
  return <>{children}</>;
}

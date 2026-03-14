/**
 * WorkspaceIdLayout
 *
 * Responsibilities:
 * - Render the workspace-level contextual shell (name + nav tabs)
 * - Provide a consistent page chrome for all workspace sub-pages
 */

import { WorkspaceShell } from "@/modules/workspace.module/_components/workspace-shell";

export default async function WorkspaceIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { slug, workspaceId } = await params;

  return (
    <div className="mx-auto max-w-7xl space-y-4 duration-500 animate-in fade-in px-4 py-4 sm:px-6 sm:py-6">
      <WorkspaceShell slug={slug} workspaceId={workspaceId} />
      {children}
    </div>
  );
}

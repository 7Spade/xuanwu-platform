import { WorkspaceGrantsView } from "@/modules/workspace.module/_components/workspace-grants-view";

export default async function WorkspaceMembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <WorkspaceGrantsView workspaceId={workspaceId} />;
}

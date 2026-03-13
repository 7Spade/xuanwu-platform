export default async function InviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <div>Placeholder: invite token {token}</div>;
}

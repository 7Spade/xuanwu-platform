export default function WorkspaceLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <>
      {sidebar}
      {children}
    </>
  );
}

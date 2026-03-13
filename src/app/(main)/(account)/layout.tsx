export default function AccountLayout({
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

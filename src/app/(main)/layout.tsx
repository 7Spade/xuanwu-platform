/**
 * AccountProvider layout
 *
 * Responsibilities:
 * - Load authenticated user
 * - Fetch available accounts (personal + organizations)
 * - Provide account list and permissions to all (main) routes
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

/**
 * SlugProvider layout
 *
 * Responsibilities:
 * - Resolve `slug` from URL params
 * - Determine whether it represents a personal account or an organization
 * - Verify current user has access permissions for this slug
 */
export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  await params;
  return <>{children}</>;
}

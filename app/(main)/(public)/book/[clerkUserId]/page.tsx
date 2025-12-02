import PublicProfile from "@/components/PublicProfile";
import { clerkClient } from "@clerk/nextjs/server";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>;
}) {
  const { clerkUserId } = await params;

  // Defensive: clerkClient or its `users` namespace can occasionally be undefined
  // in certain dev bundler states. Catch errors and continue rendering a usable
  // page (the `PublicProfile` component can accept `fullName` as null).
  let fullName: string | null = null;
  try {
    const user = await clerkClient.users.getUser(clerkUserId);
    fullName = user && (user.fullName ?? null);
  } catch (err: any) {
    // Log the original error for diagnostics but do not crash the request.
    // The booking UI will still render and surface any downstream errors client-side.
    // eslint-disable-next-line no-console
    console.error(
      "PublicProfilePage: failed to fetch Clerk user:",
      err?.message ?? err
    );
  }

  // Render PublicProfile component; `fullName` may be null if lookup failed.
  return <PublicProfile userId={clerkUserId} fullName={fullName} />;
}

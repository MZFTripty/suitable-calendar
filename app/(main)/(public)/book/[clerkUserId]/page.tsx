/* eslint-disable @typescript-eslint/no-explicit-any */
import PublicProfile from "@/components/PublicProfile";
import { clerkClient } from "@clerk/nextjs/server";

// Resolve the exported `clerkClient` which may be either a function
// (async initializer) or an already-instantiated object depending on
// the installed Clerk package version. This helper normalizes both.
async function resolveClerkClient() {
  const anyClient = clerkClient as any;
  if (typeof anyClient === "function") return await anyClient();
  return anyClient;
}
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
    const client = await resolveClerkClient();
    const user = await client.users.getUser(clerkUserId);
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

import PrivateNavbar from "@/components/PrivateNavbar";
import PublicNavbar from "@/components/PublicNavbar";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  return (
    <main className="relative">
        
      {/* Render PrivateNavBar if user exists, otherwise PublicNavBar */}
      {user ? <PrivateNavbar /> : <PublicNavbar />}

      {/* Render the children */}
      <section className="pt-36">{children}</section>
    </main>
  );
}

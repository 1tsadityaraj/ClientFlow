import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../../lib/auth.js";
import MembersPageClient from "./MembersPageClient";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return <MembersPageClient />;
}

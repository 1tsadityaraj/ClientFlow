import { redirect } from "next/navigation";
import { auth } from "../../../../lib/auth.js";
import MembersPageClient from "./MembersPageClient";

export default async function MembersPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <MembersPageClient />;
}

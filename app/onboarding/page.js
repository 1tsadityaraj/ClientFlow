import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth.js";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // In a fuller implementation we would handle logo upload + first invite here.

  redirect("/dashboard");
}


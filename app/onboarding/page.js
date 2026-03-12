import { redirect } from "next/navigation";
import { auth } from "../../lib/auth.js";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // In a fuller implementation we would handle logo upload + first invite here.

  redirect("/dashboard");
}


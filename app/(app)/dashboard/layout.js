import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import MobileHeader from "@/components/MobileHeader";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  let primaryColor = "#6366f1"; // Default indigo

  if (session?.user?.orgId) {
    const org = await prisma.org.findUnique({
      where: { id: session.user.orgId },
      select: { primaryColor: true },
    });
    if (org?.primaryColor) {
      primaryColor = org.primaryColor;
    }
  }

  // Inject CSS variables directly into a style tag or a provider wrapper
  // We can just use a style block since this layout wraps all authenticated views
  return (
    <>
      <style suppressHydrationWarning>{`
        :root {
          --brand-primary: ${primaryColor};
        }
      `}</style>
      <div className="brand-scoped flex-1 h-screen flex flex-col">
        <MobileHeader user={session?.user} />
        <div className="flex-1 relative overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
}

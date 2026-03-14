import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";

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
      <div className="brand-scoped">
        {children}
      </div>
    </>
  );
}

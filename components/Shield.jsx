"use client";
import { useSession } from "next-auth/react";

export function Shield({ fallback = null, children, blockRoles = ["client"] }) {
  const { data: session } = useSession();

  if (!session?.user?.role) return fallback;

  if (blockRoles.includes(session.user.role)) {
    return fallback;
  }

  return <>{children}</>;
}

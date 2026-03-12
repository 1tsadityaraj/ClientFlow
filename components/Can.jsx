"use client";

import { useSession } from "next-auth/react";
import { PERMISSIONS } from "../lib/permissions.js";

export function Can({ permission, children, fallback = null }) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  const role = session?.user?.role;
  if (!role) return null;

  if (PERMISSIONS[role]?.[permission]) {
    return children;
  }

  return fallback;
}


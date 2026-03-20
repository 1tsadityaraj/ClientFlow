"use client";
import { Menu } from "lucide-react";

export default function MobileHeader({ user }) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 px-4 lg:hidden">
      <button
        onClick={() => window.dispatchEvent(new Event("toggle-mobile-sidebar"))}
        className="text-zinc-900 dark:text-zinc-900 dark:text-zinc-50"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary text-xs font-bold text-white shadow-lg">
        CF
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white shadow-lg">
        {(user?.name || "U").charAt(0).toUpperCase()}
      </div>
    </div>
  );
}

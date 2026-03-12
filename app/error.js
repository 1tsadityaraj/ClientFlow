"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    // @TODO: Swap for Sentry later
    console.error("Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        An unexpected error has occurred. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

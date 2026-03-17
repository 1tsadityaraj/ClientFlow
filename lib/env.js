export function validateEnv() {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
  const optional = [
    "RESEND_API_KEY",
    "STRIPE_SECRET_KEY",
    "AWS_ACCESS_KEY_ID",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ];

  const missingRequired = required.filter((key) => !process.env[key]);
  if (missingRequired.length > 0) {
    // If we are in a build environment (like Vercel), don't crash the build.
    // The variables will be validated again at runtime.
    if (process.env.NEXT_PHASE === "phase-production-build" || process.env.CI) {
      console.warn(
        `⚠️ Building without required environment variables: ${missingRequired.join(
          ", "
        )}. This is fine if they are provided at runtime.`
      );
      return;
    }
    throw new Error(
      `❌ Invalid environment variables: Missing required keys: ${missingRequired.join(
        ", "
      )}`
    );
  }

  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `⚠️ Warning: Missing optional environment variables: ${missingOptional.join(
        ", "
      )}. Some features may not work as expected.`
    );
  }
}

// Run validation immediately when this file is imported
validateEnv();



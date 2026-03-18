#!/bin/bash
# Run this once to push all env vars to Vercel production
# Usage: bash scripts/sync-vercel-env.sh

echo "Syncing environment variables to Vercel..."

# Core
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# App URL
vercel env add NEXT_PUBLIC_APP_URL production

# Pusher
vercel env add PUSHER_APP_ID production
vercel env add PUSHER_KEY production
vercel env add PUSHER_SECRET production
vercel env add PUSHER_CLUSTER production
vercel env add NEXT_PUBLIC_PUSHER_KEY production
vercel env add NEXT_PUBLIC_PUSHER_CLUSTER production

# Email
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production

# Storage
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add S3_BUCKET_NAME production
vercel env add AWS_REGION production
vercel env add AWS_ENDPOINT_URL production

# Rate limiting
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

# Stripe
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PRO_PRICE_ID production

# Seeding
vercel env add SEED_SECRET production

# Demo hint
vercel env add NEXT_PUBLIC_SHOW_DEMO_HINT production

echo "Done! Now run: vercel --prod"

# ClientFlow

**A production-grade B2B SaaS platform with role-based access control, multitenancy, and a branded client portal — built for modern digital agencies.**

[![ClientFlow Dashboard](/Users/aditya/.gemini/antigravity/brain/c112d8ff-463f-477b-bafc-c6487a670eba/clientflow_dashboard_mockup_1773556803626.png)](https://client-flow-sooty.vercel.app)

> [!IMPORTANT]
> **Live Demo:** [https://client-flow-sooty.vercel.app](https://client-flow-sooty.vercel.app)

---

## ✨ Key Features

| Category | Details |
| --- | --- |
| **Multitenancy** | Org-scoped data isolation — every DB query filters by `orgId`. Tenants never see each other's data. |
| **RBAC** | 4-tier roles: Admin, Manager, Member, Client. Permissions enforced on both UI (`<Can>` component) and API routes (`assertPermission`). |
| **Project Management** | Full project lifecycle with tasks (status, priority, assignee, due dates), file uploads, and comment threads. |
| **File Storage** | AWS S3 presigned uploads + downloads with metadata tracking per project. |
| **Billing** | Stripe Checkout for plan upgrades, Customer Portal for subscription management, and webhook handling for plan sync. |
| **Email** | Resend-powered invite emails with tokenized accept links. |
| **Rate Limiting** | Upstash Redis rate limiter on auth routes to prevent brute-force attacks. |
| **Auth** | NextAuth v5 with JWT strategy and Credentials provider. |
| **Testing** | Vitest multitenancy isolation tests validating that Org A cannot access Org B resources. |

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 15 (App Router, Server Components) |
| **Database** | SQLite (dev) / PostgreSQL (prod via Neon) |
| **ORM** | Prisma 6 |
| **Authentication** | NextAuth.js v5 |
| **Styling** | Tailwind CSS v4 + Lucide Icons |
| **Rate Limiting** | Upstash Redis |
| **Storage** | AWS S3 |
| **Email** | Resend |
| **Payments** | Stripe |
| **Testing** | Vitest |

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/1tsadityaraj/ClientFlow.git
cd ClientFlow
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Push schema & seed database
npx prisma db push
npx prisma db seed

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Demo Credentials

| Role | Email | Password | Access Level |
| --- | --- | --- | --- |
| **Admin** | `alice@pixel.co` | `password123` | Full access: billing, settings, all projects, team management |
| **Manager** | `bob@pixel.co` | `password123` | Project management, invites, task assignment |
| **Member** | `carol@pixel.co` | `password123` | Work on assigned projects/tasks, upload files, comment |
| **Client** | `dave@acme.com` | `password123` | View only assigned projects, add comments |

---

## 🏗 Architecture

```
app/
├── (app)/dashboard/          # Authenticated dashboard pages
│   ├── page.js               # Main dashboard (Server Component)
│   ├── members/              # Team management (RBAC-gated)
│   ├── projects/[id]/        # Project detail with Tasks/Files/Comments tabs
│   └── settings/             # Org settings + billing + danger zone
├── (auth)/                   # Login & Signup flows
├── api/                      # REST API routes
│   ├── auth/[...nextauth]/   # NextAuth with rate limiting
│   ├── billing/              # Stripe checkout & portal
│   ├── invites/              # Token-based team invites
│   ├── members/              # Member CRUD + role changes
│   ├── orgs/                 # Org CRUD
│   ├── projects/             # Project CRUD + tasks/files/comments
│   └── webhooks/stripe/      # Stripe webhook handler
├── onboarding/               # Post-signup flow
└── page.js                   # Landing page
lib/
├── auth.js                   # NextAuth v5 config
├── permissions.js            # RBAC permission map + helpers
├── orgScope.js               # Org-scoped query helpers
├── prisma.js                 # Prisma client singleton
├── rateLimit.js              # Upstash rate limiter
├── stripe.js                 # Stripe client
├── s3.js                     # S3 presigned URL helpers
├── email.js                  # Resend email templates
└── plans.js                  # Plan definitions
components/
└── Can.jsx                   # Client-side RBAC gate component
__tests__/
├── multitenancy.test.js      # Tenant isolation tests (8 tests)
└── helpers/                  # Test seed data & session mocking
```

---

## 🔒 Role Permissions Matrix

| Permission | Admin | Manager | Member | Client |
| --- | :---: | :---: | :---: | :---: |
| Create projects | ✅ | ✅ | ❌ | ❌ |
| Delete projects | ✅ | ❌ | ❌ | ❌ |
| Create/update tasks | ✅ | ✅ | ✅ | ❌ |
| Upload files | ✅ | ✅ | ✅ | ❌ |
| Comment | ✅ | ✅ | ✅ | ✅ |
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Change roles | ✅ | ❌ | ❌ | ❌ |
| View billing | ✅ | ❌ | ❌ | ❌ |
| Update/delete org | ✅ | ❌ | ❌ | ❌ |
| View all projects | ✅ | ✅ | ✅ | ❌ |
| View assigned only | — | — | — | ✅ |

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

The test suite validates multitenancy isolation — ensuring that a user from Org A cannot read, update, or delete resources belonging to Org B across all API endpoints (projects, tasks, files, members).

---

## 📦 Deployment Checklist

- [ ] PostgreSQL database (Supabase, Railway, Neon)
- [ ] Upstash Redis for rate limiting
- [ ] AWS S3 or Cloudflare R2 for file storage
- [ ] Stripe account with webhook endpoint
- [ ] Resend account for transactional emails
- [ ] Set all environment variables from `.env.example`

---

Built with ❤️ by **Aditya Raj**

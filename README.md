# ClientFlow

ClientFlow is a complete full-stack B2B SaaS project with role-based access control, multi-tenancy, and a branded client portal.

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js (App Router) |
| **Database** | MongoDB |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js |
| **Styling** | Tailwind CSS & Lucide Icons |
| **Rate Limiter** | Upstash Redis |
| **Storage** | AWS S3 / Cloudflare R2 |
| **Email** | Resend |
| **Payments** | Stripe |

## Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clientflow
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in all the required environment variables. See \`.env.example\` for references.

3. **Install dependencies**
   ```bash
   npm install
   ```

    npx prisma db push
    ```

5. **Seed the database**
   ```bash
   npx prisma db seed
   ```
   *This creates testing organizations, users (such as bob@pixel.co), projects, and tasks.*

6. **Run the development server**
   ```bash
   npm run dev
   ```
   Open \`http://localhost:3000\` in your browser.

## Deployed Services Needed

To deploy this project successfully, you will need the following services:

- **Database**: PostgreSQL database (e.g., Supabase or Railway)
- **Rate Limiting**: Upstash Redis
- **File Storage**: Object storage like AWS S3 or Cloudflare R2
- **Email Delivery**: Resend
- **Payments**: Stripe

## Role Permissions

| Role | Permissions |
| --- | --- |
| **Admin** | Full access to billing, organization settings, team members, and all internal projects. |
| **Manager** | Can handle day-to-day operations, create projects, assign resources, and invite team members. |
| **Member** | Employee level. Can work on assigned projects and tasks but cannot modify org settings. |
| **Client** | Restricted access. Only sees projects explicitly assigned to them as a \`clientUser\`. |

## Test Instructions

To run the test suite, use the Vitest commands:

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Generate code coverage
npm run test:coverage
```

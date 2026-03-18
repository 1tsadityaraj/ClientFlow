import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
// bcryptjs v3 might need explicit function imports in some environments
import { compare } from "bcryptjs";

import { prisma } from "./prisma.js";
import authConfig from "./auth.config.js";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development' || process.env.VERCEL === '1',

  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password required');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { org: true }
          });

          if (!user || !user.hashedPassword) {
            throw new Error('No user found');
          }

          const isValid = await compare(
            credentials.password,
            user.hashedPassword
          );

          if (!isValid) {
            throw new Error('Invalid password');
          }

          const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            orgId: user.orgId,
            orgName: user.org?.name || "No Organization",
          };

          console.log(`Authorize sucessful for ${user.email}`);
          return userData;
        } catch (err) {
          console.error('Authorize function error:', err);
          return null;
        }

      },
    }),
  ],
});


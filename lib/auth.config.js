export default {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.orgId = user.orgId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.orgId = token.orgId;
      }
      return session;
    },
  },
  providers: [], // Added in auth.js
};

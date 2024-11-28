import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createGuest, getGuest } from "./data-service";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  // used for middleware.js
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    // after used send login but before is logged to appliaction
    async signIn({ user, account, profile }) {
      try {
        const existingGuest = await getGuest(user.email);
        // if there is not guest for logged user
        if (!existingGuest)
          await createGuest({ email: user.email, full_name: user.name });
        return true;
      } catch {
        return false;
      }
    },
    // called after signIn callback
    async session({ session, user }) {
      // add guest id to the session
      const guest = await getGuest(session.user.email);
      session.user.guestId = guest.guestId;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);

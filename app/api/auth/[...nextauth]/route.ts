import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          let existingUser = await User.findOne({ email });

          if (!existingUser) {
            // Sign-up (New user)
            existingUser = await User.create({
              name: user.name || "Google User",
              email,
              image: user.image || "",
              photoUrl: user.image || "",
              provider: "google",
              providerId: account.providerAccountId,
              role: "regular",
            });
          } else {
            // Login (Existing user) - update or link provider/image if missing
            let updated = false;
            if (!existingUser.provider || existingUser.provider === "credentials") {
              existingUser.provider = "google";
              existingUser.providerId = account.providerAccountId;
              updated = true;
            }
            if (!existingUser.image && user.image) {
              existingUser.image = user.image;
              existingUser.photoUrl = user.image;
              updated = true;
            }
            if (updated) {
              await existingUser.save();
            }
          }

          // Attach database properties to the user object for JWT callback
          user.id = existingUser._id.toString();
          (user as unknown as Record<string, unknown>).role = existingUser.role || "regular";
          return true;
        } catch (error) {
          console.error("Error in NextAuth Google signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as Record<string, unknown>).role || "regular";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = (token.role as string) || "regular";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "uubKBsb2w8vkuYIFuts66ri7JHVkhv88eHB",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

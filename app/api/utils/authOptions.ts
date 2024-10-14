import { NextApiRequest, NextApiResponse } from "next";
import { AuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { Adapter } from "next-auth/adapters";
import { createMember } from "@/lib/actions/user.actions";

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  adapter: MongoDBAdapter(
    clientPromise() as unknown as Promise<MongoClient>
  ) as Adapter,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (user && user.id) {
        try {
          const userId = user.id;
          const userEmail = user.email;
          await createMember(userId, userEmail);
          session.user.id = user.id;
        } catch (error) {
          console.error("Error creating member:", error);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === `${baseUrl}/api/auth/session`) {
        return baseUrl;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
};

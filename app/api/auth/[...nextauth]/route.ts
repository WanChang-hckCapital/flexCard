import { AuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from 'next-auth/providers/google';
import LineProvider from 'next-auth/providers/line';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from "next-auth/providers/apple";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from '@/lib/mongodb'
import { MongoClient } from "mongodb";
import { Adapter } from "next-auth/adapters";
import { createMember } from "@/lib/actions/user.actions";

declare module 'next-auth' {
    interface Session {
        user: {
            id: string,
            name: string,
            image: string,
        }
    }
}

export const authOptions: AuthOptions = {
    secret: process.env.AUTH_SECRET,
    adapter: MongoDBAdapter(clientPromise() as Promise<MongoClient>) as Adapter,
    pages: {
        signIn: '/auth/sign-in'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
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
        })

    ],
    callbacks: {
        async session({ session, user }) {
            if (user && user.id) {
                const userId = user.id;

                await createMember(userId);
                session.user.id = user.id;
            }
            return Promise.resolve(session);
        },
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
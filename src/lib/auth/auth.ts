import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
    } & DefaultSession["user"]
  }
}

import { DefaultSession } from "next-auth";

// For demo purposes - this mocks a user
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@securesonic.com',
  name: 'Demo User',
  hashedPassword: '$2a$12$k8P1JTu2RUr.bJD8cbVe1.6/uRz75Ofa1DQpPyR6NCQQcCIHlFp1.', // hashed 'password123'
  image: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
};

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  // Configure one or more authentication providers
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    Google({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        // For demo account
        if (credentials.email === DEMO_USER.email) {
          const isValidPassword = await compare(
            credentials.password,
            DEMO_USER.hashedPassword
          );

          if (isValidPassword) {
            return {
              id: DEMO_USER.id,
              name: DEMO_USER.name,
              email: DEMO_USER.email,
              image: DEMO_USER.image,
            };
          } else {
            throw new Error('Invalid credentials');
          }
        }

        try {
          // For other users, check the database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user || !user?.hashedPassword) {
            throw new Error('User not found');
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('An error occurred during authentication');
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub || DEMO_USER.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
}; 
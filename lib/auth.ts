import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
  providers: [
    // Magic link via Resend
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM || "SnelRIE <noreply@snelrie.nl>",
    }),

    // Credentials (email + wachtwoord)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vul je email en wachtwoord in");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          throw new Error("Ongeldig email of wachtwoord");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Ongeldig email of wachtwoord");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.naam,
          image: user.image,
        };
      },
    }),

    // Google OAuth (voorbereid, werkt zodra env vars gezet zijn)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Bij magic link: email is al verified
      if (account?.provider === "email") {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, naam: true },
        });
        token.role = dbUser?.role || "OWNER";
        token.naam = dbUser?.naam || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.naam = token.naam as string | null;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Wanneer een user via magic link of OAuth wordt aangemaakt,
      // check of er al een bestaande user is met dat email (van scan)
      // De PrismaAdapter handelt dit af via de database unique constraint
      console.log(`[Auth] New user created: ${user.email}`);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

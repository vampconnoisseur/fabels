import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma"
import { Resend } from 'resend';
import EmailProvider, { SendVerificationRequestParams } from "next-auth/providers/email";
import VerificationEmail from "@/app/components/VerificationEmail";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
    session: {
        strategy: "database",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest: async (params: SendVerificationRequestParams) => {
                const { identifier, url, provider } = params;
                try {
                    const resend = new Resend(process.env.EMAIL_SERVER_PASSWORD)
                    await resend.emails.send({
                        from: provider.from,
                        to: identifier,
                        subject: 'Your Fabels Login Link',
                        react: VerificationEmail({ url, identifier })
                    });
                } catch (error) {
                    console.log({ error });
                }
            },
        }),
    ],
    pages: {
        signIn: "/",
        signOut: "/",
        verifyRequest: "/verify-request",
        error: "/verification-error"
    },
    callbacks: {
        session: ({ session, token, user }) => {
            console.log("FROM SESSION:", { session, token, user })
            return {
                ...session,
                user: {
                    ...session.user,
                    id: user.id
                }
            };
        },
    }
};

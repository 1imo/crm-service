import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from 'axios'
import { JWT } from 'next-auth/jwt'

// Base interface for nullable fields
interface BaseUser {
    id: string | null | undefined;
    email: string | null | undefined;
    firstName: string | null | undefined;
    lastName: string | null | undefined;
    role: string | null | undefined;
    companyId: string | null | undefined;
}

// Interface for authorized users (must have non-null values)
interface AuthorizedUser {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
}

interface AuthUser extends BaseUser { }

// Extend the built-in types
declare module "next-auth" {
    interface User extends BaseUser {
        name: string | null | undefined;
    }

    interface Session {
        user: User
    }
}

// Also extend the JWT type to include our custom fields
declare module "next-auth/jwt" {
    interface JWT extends BaseUser {
        name: string | null | undefined;
    }
}

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3003'
const CRM_SERVICE_API_KEY = process.env.CRM_SERVICE_API_KEY
const CRM_SERVICE_NAME = 'crm-service'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/signin`, {
                        email: credentials?.email,
                        password: credentials?.password
                    }, {
                        headers: {
                            'X-API-Key': CRM_SERVICE_API_KEY,
                            'X-Service-Name': CRM_SERVICE_NAME,
                            'X-Target-Service': 'auth-service',
                        }
                    });

                    const authResponse = response.data;
                    console.log('Auth Response:', authResponse);

                    if (authResponse?.user) {
                        const userData = authResponse.user;
                        const user: AuthorizedUser = {
                            id: userData.id,
                            email: userData.email,
                            name: `${userData.firstName} ${userData.lastName}`.trim(),
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            role: userData.role,
                            companyId: userData.companyId
                        };
                        console.log('Authorized User:', user);
                        return user;
                    }
                    return null;
                } catch (error) {
                    console.error('Authentication error:', error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // Initial sign in
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.role = user.role;
                token.companyId = user.companyId;
            }

            // Handle updates to session
            if (trigger === "update" && session?.user?.companyId) {
                token.companyId = session.user.companyId;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string,
                    firstName: token.firstName as string,
                    lastName: token.lastName as string,
                    role: token.role as string,
                    companyId: token.companyId as string,
                };
            }
            return session;
        }
    },
    pages: {
        signIn: '/signin',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
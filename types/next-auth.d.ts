import type { DefaultSession } from 'next-auth'
import 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            role: string
            companyId?: string
        } & DefaultSession['user']
    }

    interface User {
        id: string
        email: string
        name: string
        role: string
        companyId?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string
    }
} 
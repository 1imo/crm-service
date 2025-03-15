import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'

export default withAuth(
    function middleware(req) {
        const isSignInPage = req.nextUrl.pathname.startsWith('/signin')
        const isAuthPage = req.nextUrl.pathname.startsWith('/api/auth')

        if (isSignInPage || isAuthPage) {
            return NextResponse.next()
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/signin',
        },
    }
)

export function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', request.nextUrl.pathname)

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: [
        '/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)',
    ],
} 
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Get the pathname
    const path = req.nextUrl.pathname

    // Get the token from the session
    const token = req.nextauth.token

    // Define protected routes and their required roles/account types
    const protectedRoutes = {
      "/dashboard": ["user", "agent", "business"],
      "/properties/create": ["agent", "business"],
      "/services/create": ["business", "service-provider"],
      "/leisure/create": ["business"],
      "/connect/crm": ["user", "agent", "business"],
    }

    // Check if the current path is protected
    const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
      path.startsWith(route)
    )

    if (isProtectedRoute) {
      // Find the matching protected route
      const matchedRoute = Object.entries(protectedRoutes).find(([route]) =>
        path.startsWith(route)
      )

      if (matchedRoute) {
        const [, allowedTypes] = matchedRoute

        // Check if user's account type is allowed for this route
        if (!token?.accountType || !allowedTypes.includes(token.accountType)) {
          // Redirect to home page or show error
          return NextResponse.redirect(new URL("/unauthorized", req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Specify which routes to protect
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/properties/create/:path*",
    "/services/create/:path*",
    "/leisure/create/:path*",
    "/connect/crm/:path*",
  ],
}
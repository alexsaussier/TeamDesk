import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/projects/:path*",
    "/workforce/:path*",
    "/dashboard/:path*",
    "/timeline/:path*",

    // Add other protected routes
  ]
} 
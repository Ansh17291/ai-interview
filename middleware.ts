import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime instead of Edge Runtime to support Firebase Admin SDK
export const runtime = "nodejs";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get("session")?.value;

  // Skip verification in middleware if runtime environment doesn't support Firebase Admin SDK
  // Firebase Admin SDK is not compatible with Edge Runtime (which Next.js Middleware uses on Vercel)
  // We'll just check for cookie existence here and let server components handle full verification.
  const isDevelopment = process.env.NODE_ENV === "development";

  // Check if user is trying to access auth routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If user is authenticated, redirect to home
    if (sessionCookie) {
      if (pathname !== "/") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!sessionCookie) {
    // No session, redirect to sign-in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Since we can't reliably use Firebase Admin in Edge Middleware on Vercel,
  // we'll just allow the request to proceed if the cookie exists.
  // The Server Components (which run in Node runtime) will do the full verification via getCurrentUser().
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

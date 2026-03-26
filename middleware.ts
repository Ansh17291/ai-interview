import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase/admin";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];

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

  // Check if user is trying to access auth routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If user is authenticated, redirect to home
    if (sessionCookie) {
      try {
        await auth.verifySessionCookie(sessionCookie, true);
        return NextResponse.redirect(new URL("/", request.url));
      } catch (error) {
        // Session invalid, allow access to auth routes
        return NextResponse.next();
      }
    }
    // No session, allow access to auth routes
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!sessionCookie) {
    // No session, redirect to sign-in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    // Verify the session cookie
    await auth.verifySessionCookie(sessionCookie, true);
    // Session valid, continue
    return NextResponse.next();
  } catch (error) {
    // Session invalid, redirect to sign-in
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    // Clear the invalid session cookie
    response.cookies.delete("session");
    return response;
  }
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

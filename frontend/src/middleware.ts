/**
 * @file src/middleware.ts
 */

import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/cart",
  "/checkout",
  "/orders",
  "/profile",
  "/admin",
];

const AUTH_ROUTES = ["/forgot-password", "/signup", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const hasAuthTokens = Boolean(accessToken || refreshToken);

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtectedRoute && !hasAuthTokens) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Alongside requireAuth() above: make sure THIS redirect is never
    // cached, so a stale "logged out" decision from one moment can't
    // get replayed on a later Link click when you're actually
    // authenticated again.
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (isAuthRoute && hasAuthTokens) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api/ (we don't proxy API calls through middleware)
     * This regex pattern is the official recommended approach.
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

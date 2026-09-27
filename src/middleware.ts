import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("tixolve_access_token")?.value;
  const { pathname } = request.nextUrl;

  const protectedDashboardRoutes = [
    "/",
    "/tickets",
    "/customers",
    "/ai_automation",
    "/knowledge_base",
    "/analytics",
    "/billing",
    "/integrations",
    "/settings",
    "/team",
  ];

  const isProtectedRoute =
    pathname === "/" ||
    protectedDashboardRoutes.some(
      (route) => route !== "/" && (pathname === route || pathname.startsWith(`${route}/`))
    );

  // If requesting a protected route without a valid cookie token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting login page, redirect to dashboard root
  if (token && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

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

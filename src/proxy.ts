import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("tixolve_access_token")?.value;
  const { pathname } = request.nextUrl;

  // In cross-origin deployments (e.g. Next.js on localhost:3000 / frontend domain and
  // Laravel API on illogri-issue.test / api domain), the Next.js server does not
  // receive the HttpOnly authentication cookie set by the backend.
  // Therefore, middleware/proxy cookie checks serve as preliminary routing hints only.
  // Definitive authentication verification is performed by protected layouts and pages
  // validating against GET /api/user.
  if (
    token &&
    pathname === "/auth/login" &&
    !request.nextUrl.searchParams.has("callbackUrl") &&
    !request.nextUrl.searchParams.has("error")
  ) {
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

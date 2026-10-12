import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("tixolve_access_token")?.value;
  const { pathname } = request.nextUrl;

  // In production multi-subdomain deployments (app.tixolve.com & api.tixolve.com),
  // cookies set with Domain=.tixolve.com are visible to the Next.js edge server.
  // In cross-origin/local environments, the edge server may not receive backend cookies.
  // Furthermore, edge middleware cannot validate token revocation or expiration against
  // Laravel Sanctum's database. Therefore, proxy cookie checks serve as preliminary hints,
  // while the backend API remains authoritative for session validation and tenant isolation.
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

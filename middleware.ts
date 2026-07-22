import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken =
    request.cookies.get("yazmart-session-token")?.value ||
    request.cookies.get("sb-access-token")?.value ||
    request.cookies.get("yazmart-user-id")?.value;

  // 1. Protected Admin Routes Security
  if (pathname.startsWith("/admin")) {
    if (!sessionToken) {
      return NextResponse.rewrite(new URL("/_not-found", request.url));
    }
  }

  // 2. Protected Seller Routes Security
  if (pathname.startsWith("/seller")) {
    if (!sessionToken) {
      return NextResponse.rewrite(new URL("/_not-found", request.url));
    }
  }

  // 3. Protected Customer Routes Security
  if (pathname.startsWith("/profile")) {
    if (!sessionToken) {
      return NextResponse.rewrite(new URL("/_not-found", request.url));
    }
  }

  // 4. Redirect logged-in users away from /auth page
  if (pathname.startsWith("/auth") && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/profile/:path*", "/auth/:path*"],
};
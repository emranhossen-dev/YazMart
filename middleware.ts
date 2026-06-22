import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("sb-access-token")?.value;

  // ১. প্রটেক্টেড অ্যাডমিন রাউট সিকিউরিটি
  if (pathname.startsWith("/admin")) {
    if (!sessionToken) {
      const loginUrl = new URL("/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ২. লগইন করা ইউজারকে অথ পেজে যেতে না দিয়ে হোম পেজে পাঠানো
  if (pathname.startsWith("/auth") && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
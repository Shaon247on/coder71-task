// middleware.ts  (root-level — Next.js picks this up automatically)
// Purpose: Protect /dashboard and /api/layout, /api/user from unauthenticated access.
// Runs on the Edge runtime — keep it light (no Prisma, no heavy libs).

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_PATHS = ["/dashboard", "/api/layout", "/api/user"];

// Routes only accessible when NOT logged in
const AUTH_ONLY_PATHS = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value ?? null;
  const payload = token ? verifyToken(token) : null;
  const isAuthenticated = payload !== null;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthOnly && isAuthenticated) {
    // Already logged in — redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/layout/:path*", "/api/user/:path*", "/login", "/signup"],
};
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

const PROTECTED_PATHS = ["/dashboard", "/api/layout", "/api/user"];
const AUTH_ONLY_PATHS = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value ?? null;
  const payload = token ? await verifyToken(token) : null;
  const isAuthenticated = payload !== null;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthOnly = AUTH_ONLY_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/layout/:path*",
    "/api/user/:path*",
    "/login",
    "/signup",
  ],
};
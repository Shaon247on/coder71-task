// lib/auth.ts
// Purpose: JWT creation/verification and HTTP-only cookie helpers.
// Keeps all auth logic in one place, separate from route handlers.

import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "slb_token"; // slb = split-layout-builder
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set.");
}

export interface JWTPayload {
  userId: string;
  email: string;
}

/** Creates a signed JWT containing userId and email */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/** Verifies a JWT. Returns the payload or null if invalid/expired. */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/** Extracts and verifies the JWT from an incoming request's cookies */
export function getAuthPayload(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Attaches a signed JWT as an HTTP-only cookie to a NextResponse */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/** Clears the auth cookie by setting maxAge to 0 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export { COOKIE_NAME };
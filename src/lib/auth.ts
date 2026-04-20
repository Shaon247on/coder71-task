import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose";
import { NextRequest, NextResponse } from "next/server";

export const COOKIE_NAME = "slb_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error(
    "Missing JWT_SECRET. Add it to .env.local and restart the dev server."
  );
}

const secretKey = new TextEncoder().encode(secret);

export interface JWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({
    userId: payload.userId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      ...payload,
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function getAuthPayload(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return await verifyToken(token);
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
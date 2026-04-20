// app/api/auth/logout/route.ts
// Purpose: Clears the auth cookie, effectively logging the user out.

import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully." });
  clearAuthCookie(response);
  return response;
}
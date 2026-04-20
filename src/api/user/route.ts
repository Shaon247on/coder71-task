// app/api/user/route.ts
// Purpose: Returns the currently authenticated user's public profile.
// Used by the frontend to hydrate the user session on load.

import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: payload.userId, email: payload.email },
  });
}
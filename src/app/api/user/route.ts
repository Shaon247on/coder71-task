import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: payload.userId,
      email: payload.email,
    },
  });
}
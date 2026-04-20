// app/api/layout/route.ts
// Purpose: GET returns the user's saved layout; POST upserts it.
// Both endpoints require authentication (enforced by middleware).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";
import { saveLayoutSchema } from "@/validators/layoutSchema";
import { LayoutNode } from "@/types/layout";

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const layout = await prisma.layout.findUnique({
    where: { userId: payload.userId },
  });

  if (!layout) {
    // No saved layout exists yet — return null, frontend will create initial tree
    return NextResponse.json({ tree: null });
  }

  return NextResponse.json({ tree: layout.tree as LayoutNode });
}

export async function POST(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = saveLayoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid layout data.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Upsert: create if first save, update if already exists
    const layout = await prisma.layout.upsert({
      where: { userId: payload.userId },
      update: { tree: parsed.data.tree },
      create: { userId: payload.userId, tree: parsed.data.tree },
    });

    return NextResponse.json({ tree: layout.tree as LayoutNode });
  } catch (error) {
    console.error("[POST /api/layout]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
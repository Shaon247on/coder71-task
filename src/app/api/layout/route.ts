import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";
import { saveLayoutSchema } from "@/validators/layoutSchema";
import { LayoutNode } from "@/types/layout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const layout = await prisma.layout.findUnique({
    where: { userId: payload.userId },
  });

  return NextResponse.json(
    {
      tree: (layout?.tree as LayoutNode | null) ?? null,
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = saveLayoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid layout data.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const tree = parsed.data.tree as Prisma.InputJsonValue;

    const layout = await prisma.layout.upsert({
      where: { userId: payload.userId },
      update: { tree },
      create: {
        userId: payload.userId,
        tree,
      },
    });

    return NextResponse.json(
      { tree: layout.tree as unknown as LayoutNode },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("[POST /api/layout]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

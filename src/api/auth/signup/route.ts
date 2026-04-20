// app/api/auth/signup/route.ts
// Purpose: Creates a new user account with a hashed password and issues a JWT cookie.

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { signupSchema } from "@/validators/authSchema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Check if email is already taken
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the password with bcrypt (12 rounds — good balance of security/speed)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Issue JWT and set it as an HTTP-only cookie
    const token = signToken({ userId: user.id, email: user.email });
    const response = NextResponse.json(
      { user: { id: user.id, email: user.email } },
      { status: 201 }
    );
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("[POST /api/auth/signup]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
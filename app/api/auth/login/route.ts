import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "กรุณากรอกอีเมลและรหัสผ่าน" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  const token = await createSessionToken(user.id);

  const response = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
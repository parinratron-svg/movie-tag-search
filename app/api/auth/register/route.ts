import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: { email: ["อีเมลนี้ถูกใช้ไปแล้ว"] } },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = await createSessionToken(user.id);

  const response = NextResponse.json(
    { id: user.id, name: user.name, email: user.email },
    { status: 201 }
  );

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
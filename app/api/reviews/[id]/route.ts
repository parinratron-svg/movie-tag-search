import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const updateSchema = z.object({
  content: z.string().min(1, "กรุณาเขียนรีวิว").max(1000),
  rating: z.number().int().min(1).max(5),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.review.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "ไม่พบรีวิว" }, { status: 404 });
  }

  if (existing.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขรีวิวนี้" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.review.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "ไม่พบรีวิว" }, { status: 404 });
  }

  if (existing.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์ลบรีวิวนี้" }, { status: 403 });
  }

  await prisma.review.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const editRequestSchema = z.object({
  content: z.string().min(1, "กรุณากรอกข้อความรีวิว").max(1000),
  rating: z.number().int().min(1).max(5),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "ไม่พบรีวิว" }, { status: 404 });
    }

    // Check ownership
    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ขอแก้ไขรีวิวนี้" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = editRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลรีวิวไม่ถูกต้อง กรุณากรอกข้อความ 1-1000 ตัวอักษร" }, { status: 400 });
    }

    // If user is ADMIN, auto-approve immediately
    if (user.role === "ADMIN") {
      const updated = await prisma.review.update({
        where: { id },
        data: {
          content: parsed.data.content,
          rating: parsed.data.rating,
          pendingContent: null,
          pendingRating: null,
          editStatus: "APPROVED",
          editRequestedAt: null,
        },
      });
      return NextResponse.json({ message: "อัปเดตรีวิวเรียบร้อยแล้ว", review: updated });
    }

    // For regular user: set editStatus to PENDING and save pending fields
    const updated = await prisma.review.update({
      where: { id },
      data: {
        pendingContent: parsed.data.content,
        pendingRating: parsed.data.rating,
        editStatus: "PENDING",
        editRequestedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "ส่งคำขอแก้ไขเรียบร้อยแล้ว กรุณารอแอดมินอนุมัติ",
      review: updated,
    });
  } catch (err: any) {
    console.error("Error in request-edit:", err);
    return NextResponse.json(
      { error: err?.message || "เกิดข้อผิดพลาดในการส่งคำขอแก้ไข" },
      { status: 500 }
    );
  }
}

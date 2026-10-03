import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const MAX_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5MB (รองรับ GIF และรูปภาพคุณภาพสูง)

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar") as File | null;

  if (!file) {
    return NextResponse.json({ error: "ไม่พบไฟล์รูปภาพ" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, GIF, WebP) เท่านั้น" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "ขนาดไฟล์ใหญ่เกินไป (กรุณาใช้ไฟล์ขนาดไม่เกิน 2.5MB)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: base64 },
  });

  return NextResponse.json({ avatarUrl: base64 });
}
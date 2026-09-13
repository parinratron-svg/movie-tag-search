import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    // ผู้ใช้ที่ไม่ได้ล็อกอิน ไม่บันทึกประวัติ แต่ไม่ error เพราะไม่ใช่การกระทำที่บังคับ
    return NextResponse.json({ skipped: true });
  }

  const { movieId } = await request.json();
  if (!movieId) {
    return NextResponse.json({ error: "ต้องระบุ movieId" }, { status: 400 });
  }

  await prisma.viewHistory.create({
    data: { userId: user.id, movieId },
  });

  return NextResponse.json({ success: true });
}
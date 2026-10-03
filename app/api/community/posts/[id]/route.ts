import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// DELETE: ลบโพสต์ (ผู้สร้างโพสต์ หรือ ADMIN สามารถลบได้)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนลบโพสต์" }, { status: 401 });
    }

    const { id: postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "ไม่พบโพสต์ที่ต้องการลบ" }, { status: 404 });
    }

    // ตรวจสอบสิทธิ์: ต้องเป็นเจ้าของโพสต์ หรือเป็น ADMIN เท่านั้น
    const isOwner = post.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ลบโพสต์นี้ (เฉพาะเจ้าของโพสต์หรือแอดมินเท่านั้น)" },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      success: true,
      message: "ลบโพสต์สำเร็จเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("DELETE /api/community/posts/[id] Error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการลบโพสต์" },
      { status: 500 }
    );
  }
}

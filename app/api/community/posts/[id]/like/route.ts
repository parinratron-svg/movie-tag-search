import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนกดถูกใจ" }, { status: 401 });
    }

    const { id: postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "ไม่พบโพสต์นี้" }, { status: 404 });
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    let hasLiked = false;

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      hasLiked = false;
    } else {
      await prisma.postLike.create({
        data: {
          userId: user.id,
          postId,
        },
      });
      hasLiked = true;
    }

    const likesCount = await prisma.postLike.count({
      where: { postId },
    });

    return NextResponse.json({
      success: true,
      hasLiked,
      likesCount,
    });
  } catch (error: any) {
    console.error("POST /api/community/posts/[id]/like Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการกดถูกใจ" }, { status: 500 });
  }
}

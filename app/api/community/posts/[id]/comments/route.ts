import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET: ดึงรายการความคิดเห็นของโพสต์
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("GET /api/community/posts/[id]/comments Error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงความคิดเห็นได้" }, { status: 500 });
  }
}

// POST: เพิ่มความคิดเห็นใหม่
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น" }, { status: 401 });
    }

    const { id: postId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "กรุณากรอกข้อความความคิดเห็น" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "ไม่พบโพสต์นี้" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    const totalComments = await prisma.comment.count({
      where: { postId },
    });

    return NextResponse.json({
      success: true,
      comment,
      commentsCount: totalComments,
    });
  } catch (error: any) {
    console.error("POST /api/community/posts/[id]/comments Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการส่งความคิดเห็น" }, { status: 500 });
  }
}

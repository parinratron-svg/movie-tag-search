import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trendingPosts = await prisma.post.findMany({
      take: 5,
      orderBy: [
        { likes: { _count: "desc" } },
        { comments: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterPath: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const formatted = trendingPosts.map((p) => ({
      id: p.id,
      title: p.title,
      movie: p.movie,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
    }));

    return NextResponse.json({ trending: formatted });
  } catch (error: any) {
    console.error("GET /api/community/trending Error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงโพสต์ยอดนิยมได้" }, { status: 500 });
  }
}

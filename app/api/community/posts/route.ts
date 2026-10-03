import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET: ดึงรายการโพสต์ทั้งหมด พร้อมข้อมูลคนโพสต์ หนังที่แท็ก ยอดไลก์ และจำนวนคอมเมนต์
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");

    // โพสต์มีอายุ 7 วัน: ลบโพสต์เก่าที่เกิน 7 วันอัตโนมัติ
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      await prisma.post.deleteMany({
        where: { createdAt: { lt: sevenDaysAgo } },
      });
    } catch (e) {
      console.warn("Auto-clean expired posts warning:", e);
    }

    const where: any = {
      createdAt: { gte: sevenDaysAgo },
    };
    if (tag) {
      where.tags = { has: tag };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
        movie: {
          select: {
            id: true,
            title: true,
            posterPath: true,
            genres: true,
            releaseYear: true,
            voteAverage: true,
          },
        },
        likes: user ? { where: { userId: user.id }, select: { id: true } } : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      tags: post.tags,
      createdAt: post.createdAt,
      user: post.user,
      movie: post.movie,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      hasLiked: user ? post.likes && post.likes.length > 0 : false,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error("GET /api/community/posts Error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลโพสต์ได้" }, { status: 500 });
  }
}

// POST: สร้างโพสต์ใหม่ (ต้องล็อกอิน)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนโพสต์" }, { status: 401 });
    }

    const { title, content, movieId, tags } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "กรุณาระบุหัวข้อโพสต์" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "กรุณาระบุเนื้อหาโพสต์" }, { status: 400 });
    }

    // ถ้ามีการระบุ movieId ให้ตรวจว่ามีหนังอยู่จริง
    if (movieId) {
      const movieExists = await prisma.movie.findUnique({
        where: { id: movieId },
        select: { id: true },
      });
      if (!movieExists) {
        return NextResponse.json({ error: "ไม่พบภาพยนตร์ที่เลือก" }, { status: 404 });
      }
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        userId: user.id,
        movieId: movieId || null,
        tags: Array.isArray(tags) ? tags : ["โซเชียลเบต้า"],
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } },
        movie: {
          select: {
            id: true,
            title: true,
            posterPath: true,
            genres: true,
            releaseYear: true,
            voteAverage: true,
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        likesCount: 0,
        commentsCount: 0,
        hasLiked: false,
      },
    });
  } catch (error: any) {
    console.error("POST /api/community/posts Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างโพสต์" }, { status: 500 });
  }
}

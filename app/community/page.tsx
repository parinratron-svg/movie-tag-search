import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import CommunityFeed from "./CommunityFeed";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "โซเชียลเบต้า — Doo Arai Dee คอมมูนิตี้คนรักหนัง",
  description: "แลกเปลี่ยนความคิดเห็น แนะนำภาพยนตร์และอนิเมะที่คุณประทับใจกับเพื่อนๆ ในคอมมูนิตี้",
};

export default async function CommunityPage() {
  const currentUser = await getCurrentUser();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // ดึงรายการโพสต์ (เฉพาะโพสต์ที่มีอายุไม่เกิน 7 วัน)
  const rawPosts = await prisma.post.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: "desc" },
    take: 30,
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
      ...(currentUser ? { likes: { where: { userId: currentUser.id }, select: { id: true } } } : {}),
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  const posts = rawPosts.map((p) => {
    const postWithLikes = p as typeof p & { likes?: { id: string }[] };
    return {
      id: p.id,
      title: p.title,
      content: p.content,
      tags: p.tags,
      createdAt: p.createdAt.toISOString(),
      user: p.user,
      movie: p.movie,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      hasLiked: Boolean(currentUser && postWithLikes.likes && postWithLikes.likes.length > 0),
    };
  });

  // ดึงโพสต์ยอดนิยมสำหรับ Sidebar
  const rawTrending = await prisma.post.findMany({
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

  const trending = rawTrending.map((t) => ({
    id: t.id,
    title: t.title,
    movie: t.movie,
    likesCount: t._count.likes,
    commentsCount: t._count.comments,
  }));

  return (
    <main>
      <CommunityFeed
        initialPosts={posts}
        initialTrending={trending}
        currentUser={
          currentUser
            ? {
                id: currentUser.id,
                name: currentUser.name,
                avatarUrl: currentUser.avatarUrl,
                role: currentUser.role,
              }
            : null
        }
      />
    </main>
  );
}

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

  // ดึงรายการโพสต์
  const rawPosts = await prisma.post.findMany({
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
      likes: currentUser ? { where: { userId: currentUser.id }, select: { id: true } } : false,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  const posts = rawPosts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    tags: p.tags,
    createdAt: p.createdAt.toISOString(),
    user: p.user,
    movie: p.movie,
    likesCount: p._count.likes,
    commentsCount: p._count.comments,
    hasLiked: currentUser ? p.likes && p.likes.length > 0 : false,
  }));

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

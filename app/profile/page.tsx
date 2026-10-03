import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProfileView from "./ProfileView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "โปรไฟล์ของฉัน — Doo Arai Dee",
  description: "จัดการโปรไฟล์ ตกแต่งพื้นหลัง ดูเลเวล เหรียญตรา และสถิติการดูภาพยนตร์ของคุณ",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  // 1. ดึงสถิติภาพรวม
  const [viewsCount, favoritesCount, watchlistCount, reviewsCount] = await Promise.all([
    prisma.viewHistory.count({ where: { userId: user.id } }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.watchlist.count({ where: { userId: user.id } }),
    prisma.review.count({ where: { userId: user.id } }),
  ]);

  // 2. ดึงประวัติกิจกรรมล่าสุด (View History, Favorites, Reviews)
  const [recentViews, recentFavoritesList, recentReviewsList] = await Promise.all([
    prisma.viewHistory.findMany({
      where: { userId: user.id },
      include: {
        movie: {
          select: { id: true, title: true, posterPath: true, genres: true },
        },
      },
      orderBy: { viewedAt: "desc" },
      take: 4,
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        movie: {
          select: { id: true, title: true, posterPath: true, genres: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.review.findMany({
      where: { userId: user.id },
      include: {
        movie: {
          select: { id: true, title: true, posterPath: true, genres: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  // แปลง Recent Activities
  const recentActivities = [
    ...recentViews.map((v) => ({
      id: `view-${v.id}`,
      type: "view" as const,
      title: `ดูหนังเรื่อง ${v.movie.title}`,
      subtitle: `หมวดหมู่: ${v.movie.genres.slice(0, 2).join(", ") || "ทั่วไป"}`,
      timeAgo: "ล่าสุด",
      movie: v.movie,
    })),
    ...recentReviewsList.map((r) => ({
      id: `review-${r.id}`,
      type: "review" as const,
      title: `รีวิวเรื่อง ${r.movie.title}`,
      subtitle: `⭐ ให้คะแนน ${r.rating}/10`,
      detail: r.content || undefined,
      rating: r.rating,
      timeAgo: "รีวิวล่าสุด",
      movie: r.movie,
    })),
    ...recentFavoritesList.map((f) => ({
      id: `fav-${f.id}`,
      type: "favorite" as const,
      title: `เพิ่ม ${f.movie.title} ในรายการโปรด`,
      subtitle: `หมวดหมู่: ${f.movie.genres.slice(0, 2).join(", ") || "ทั่วไป"}`,
      timeAgo: "รายการโปรด",
      movie: f.movie,
    })),
  ].slice(0, 5);

  const formattedReviews = recentReviewsList.map((r) => ({
    id: `rev-${r.id}`,
    type: "review" as const,
    title: r.movie.title,
    subtitle: `ให้คะแนน ${r.rating}/10`,
    detail: r.content || undefined,
    rating: r.rating,
    timeAgo: "รีวิวแล้ว",
    movie: r.movie,
  }));

  const formattedFavorites = recentFavoritesList.map((f) => ({
    id: `fav-${f.id}`,
    type: "favorite" as const,
    title: f.movie.title,
    subtitle: f.movie.genres.slice(0, 2).join(", ") || "ภาพยนตร์",
    timeAgo: "ชื่นชอบ",
    movie: f.movie,
  }));

  // 3. คำนวณ Genre Distribution
  const genreCount: Record<string, number> = {};
  recentViews.forEach((v) => {
    v.movie.genres.forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });

  const totalGenreMentions = Object.values(genreCount).reduce((a, b) => a + b, 0) || 1;
  const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);

  const defaultGenres = [
    { label: "อนิเมะ", count: 12, percentage: 60, color: "#A855F7" },
    { label: "หนังแอ็กชัน", count: 5, percentage: 25, color: "#3B82F6" },
    { label: "ไซไฟ", count: 2, percentage: 10, color: "#06B6D4" },
    { label: "อื่นๆ", count: 1, percentage: 5, color: "#E8A33D" },
  ];

  const genreStats =
    sortedGenres.length > 0
      ? sortedGenres.slice(0, 4).map(([label, count], i) => {
          const colors = ["#A855F7", "#3B82F6", "#06B6D4", "#E8A33D"];
          const percentage = Math.round((count / totalGenreMentions) * 100);
          return {
            label,
            count,
            percentage,
            color: colors[i % colors.length],
          };
        })
      : defaultGenres;

  return (
    <ProfileView
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      }}
      stats={{
        viewsCount,
        favoritesCount,
        watchlistCount,
        reviewsCount,
      }}
      recentActivities={recentActivities}
      recentReviews={formattedReviews}
      recentFavorites={formattedFavorites}
      genreStats={genreStats}
    />
  );
}
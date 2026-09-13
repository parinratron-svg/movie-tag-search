import { prisma } from "./prisma";

export async function getFavoriteGenres(userId: string, limit = 3) {
  const views = await prisma.viewHistory.findMany({
    where: { userId },
    include: { movie: { select: { genres: true } } },
    orderBy: { viewedAt: "desc" },
    take: 50, // ดูจากประวัติ 50 ครั้งล่าสุดพอ ไม่ต้องทั้งหมด
  });

  const genreCount = new Map<string, number>();
  for (const view of views) {
    for (const genre of view.movie.genres) {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
    }
  }

  return Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre);
}
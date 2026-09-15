import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Protect Admin Route
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  // 1. Stats
  const [totalMovies, totalUsers, totalReviews, totalViews, pendingEditCount] =
    await Promise.all([
      prisma.movie.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.viewHistory.count(),
      prisma.review.count({ where: { editStatus: "PENDING" } }),
    ]);

  // 2. Pending Review Edit Requests
  const pendingReviewsRaw = await prisma.review.findMany({
    where: { editStatus: "PENDING" },
    orderBy: { editRequestedAt: "desc" },
    select: {
      id: true,
      content: true,
      rating: true,
      pendingContent: true,
      pendingRating: true,
      editStatus: true,
      editRequestedAt: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      movie: { select: { id: true, title: true, posterPath: true } },
    },
  });

  const pendingReviews = pendingReviewsRaw.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    editRequestedAt: r.editRequestedAt?.toISOString() ?? null,
  }));

  // 3. All Users
  const usersRaw = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { reviews: true, views: true } },
    },
  });

  const users = usersRaw.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  // 4. All Views Categorized by User
  const allViewsRaw = await prisma.viewHistory.findMany({
    orderBy: { viewedAt: "desc" },
    select: {
      id: true,
      userId: true,
      viewCount: true,
      viewedAt: true,
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
    },
  });

  // Group by userId
  const allViewsByUser: Record<
    string,
    Array<{
      id: string;
      viewCount: number;
      viewedAt: string;
      movie: {
        id: string;
        title: string;
        posterPath: string | null;
        genres: string[];
        releaseYear: number | null;
        voteAverage: number | null;
      };
    }>
  > = {};

  allViewsRaw.forEach((v) => {
    if (!allViewsByUser[v.userId]) allViewsByUser[v.userId] = [];
    allViewsByUser[v.userId].push({
      id: v.id,
      viewCount: v.viewCount ?? 1,
      viewedAt: v.viewedAt.toISOString(),
      movie: v.movie,
    });
  });

  // 5. All Reviews
  const reviewsRaw = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      content: true,
      rating: true,
      pendingContent: true,
      pendingRating: true,
      editStatus: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      movie: { select: { id: true, title: true, posterPath: true } },
    },
  });

  const reviews = reviewsRaw.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  // 6. All Movies
  const movies = await prisma.movie.findMany({
    orderBy: { tmdbId: "desc" },
    select: {
      id: true,
      title: true,
      posterPath: true,
      releaseYear: true,
      voteAverage: true,
      genres: true,
    },
  });

  // 7. Provider Click Analytics
  const providerClicksRaw = await prisma.providerClick.groupBy({
    by: ["providerName"],
    _count: { _all: true },
    orderBy: { _count: { providerName: "desc" } },
  });

  const providerStats = providerClicksRaw.map((p) => ({
    providerName: p.providerName,
    count: p._count._all,
  }));

  return (
    <main className="min-h-screen bg-[#0F1115] text-[#F5F1E8]">
      <AdminDashboard
        stats={{
          totalMovies,
          totalUsers,
          totalReviews,
          totalViews,
          pendingEditRequestsCount: pendingEditCount,
        }}
        users={users}
        reviews={reviews}
        movies={movies}
        pendingReviews={pendingReviews}
        allViewsByUser={allViewsByUser}
        providerStats={providerStats}
        currentUserId={user.id}
      />
    </main>
  );
}

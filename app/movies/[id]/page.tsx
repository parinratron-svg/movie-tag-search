import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReviewForm from "./ReviewForm";
import MovieTabs from "./MovieTabs";
import { getCurrentUser } from "@/lib/session";
import ReviewList from "./ReviewList";
import RecordView from "./RecordView";
import WatchlistButton from "./WatchlistButton";
import WatchProvidersList from "./WatchProvidersList";
import FavoriteButton from "./FavoriteButton";
export const dynamic = "force-dynamic";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getCurrentUser();

  const movie = await prisma.movie.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      overview: true,
      posterPath: true,
      releaseYear: true,
      voteAverage: true,
      genres: true,
      tags: true,
      watchProviders: true,
      trailerKey: true,
      director: true,
      cast: true,
      watchLinks: {
        select: { id: true, platform: true },
      },
      reviews: {
        select: {
          id: true,
          content: true,
          rating: true,
          pendingContent: true,
          pendingRating: true,
          editStatus: true,
          userId: true,
          createdAt: true,
          user: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!movie) notFound();

  const isFavorited = currentUser
    ? Boolean(
        await prisma.favorite.findUnique({
          where: {
            userId_movieId: { userId: currentUser.id, movieId: id },
          },
        })
      )
    : false;

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  const detailsContent = (
    <div>
      {movie.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {movie.tags.slice(0, 8).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/50"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm text-white/50">ดูได้ที่</p>
        {movie.watchLinks.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {movie.watchLinks.map((link) => (
              <span
                key={link.id}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80"
              >
                {link.platform}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-white/40">
            ยังไม่มีข้อมูลช่องทางรับชมสำหรับเรื่องนี้
          </p>
        )}
      </div>

    </div>
  );

  const castContent = (
    <div className="space-y-4 text-sm">
      {movie.director && (
        <div>
          <p className="text-white/50">ผู้กำกับ</p>
          <p className="mt-1">{movie.director}</p>
        </div>
      )}
      {movie.cast.length > 0 ? (
        <div>
          <p className="text-white/50">นักแสดงนำ</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {movie.cast.map((name) => (
              <span
                key={name}
                className="rounded-full bg-white/5 px-3 py-1.5"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-white/40">ไม่มีข้อมูลนักแสดง</p>
      )}
    </div>
  );

  const reviewsContent = (
    <div key="reviews-tab">
      <ReviewForm movieId={movie.id} />
      <ReviewList
        reviews={movie.reviews}
        currentUserId={currentUser?.id ?? null}
        currentUserRole={currentUser?.role ?? null}
      />
    </div>
  );

  return (
    <>
      <RecordView movieId={movie.id} />
      <main className="relative min-h-screen overflow-hidden bg-[#0F1115] text-[#F5F1E8]">
      {posterUrl && (
        <div className="absolute inset-x-0 top-0 h-125 overflow-hidden">
          <Image
            src={posterUrl}
            alt=""
            fill
            className="scale-110 object-cover opacity-25 blur-2xl"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0F1115]/60 to-[#0F1115]" />
        </div>
      )}

      <div className="relative mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <div className="grid gap-8 sm:grid-cols-[240px_1fr]">
          <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-white/5 shadow-xl shadow-black/50">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                sizes="240px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/40">
                {movie.title}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#E8A33D]">
                {movie.releaseYear ?? "ไม่ทราบปี"}
              </span>
              {movie.voteAverage != null && (
                <span className="flex items-center gap-1 text-[#E8A33D]">
                  <Star className="h-3.5 w-3.5 fill-[#E8A33D]" />
                  {movie.voteAverage.toFixed(1)}
                </span>
              )}
            </div>

            <h1 className="mt-1 font-serif text-3xl sm:text-4xl">
              {movie.title}
            </h1>

            <div className="mt-4">
              <WatchlistButton movieId={movie.id} />
            </div>

            <WatchProvidersList
              movieId={movie.id}
              watchProviders={movie.watchProviders || []}
            />
            {movie.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-white/10 px-2.5 py-1 text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/70">
              {movie.overview || "ไม่มีเรื่องย่อ"}
            </p>

            {movie.director && (
              <p className="mt-3 text-sm text-white/50">
                กำกับโดย <span className="text-white/80">{movie.director}</span>
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {movie.trailerKey && (
                <a
                  href="#trailer"
                  className="inline-block rounded-full bg-[#E8A33D] px-5 py-2 text-sm font-medium text-[#0F1115] hover:bg-[#f0b558]"
                >
                  ▶ ดูตัวอย่าง
                </a>
              )}
              <FavoriteButton
                movieId={movie.id}
                initialFavorited={isFavorited}
                isLoggedIn={Boolean(currentUser)}
              />
            </div>
          </div>
        </div>

        {movie.trailerKey && (
          <div id="trailer" className="mt-10 scroll-mt-20">
            <p className="mb-3 text-sm text-white/50">ตัวอย่างภาพยนตร์</p>
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl shadow-black/50">
              <iframe
                src={`https://www.youtube.com/embed/${movie.trailerKey}`}
                title={`${movie.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        )}

        <div className="mt-10 border-t border-white/10 pt-8">
          <MovieTabs
            details={detailsContent}
            cast={castContent}
            reviews={reviewsContent}
          />
        </div>
      </div>
      </main>
    </>
  );
}
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReviewForm from "./ReviewForm";
import MovieTabs from "./MovieTabs";

export const dynamic = "force-dynamic";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      watchLinks: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!movie) notFound();

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  const detailsContent = (
    <div>
      <p className="text-sm leading-relaxed text-white/70">
        {movie.overview || "ไม่มีเรื่องย่อ"}
      </p>

      {movie.genres.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
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

      {movie.watchLinks.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-white/50">ดูได้ที่</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {movie.watchLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:border-[#E8A33D] hover:text-[#E8A33D]"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      )}
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
    <div>
      <ReviewForm movieId={movie.id} />

      <div className="mt-8 space-y-6">
        {movie.reviews.length === 0 && (
          <p className="text-sm text-white/40">
            ยังไม่มีใครรีวิวเรื่องนี้ เป็นคนแรกได้เลย
          </p>
        )}

        {movie.reviews.map((review) => (
          <article key={review.id} className="border-b border-white/5 pb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{review.user.name}</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating
                        ? "fill-[#E8A33D] text-[#E8A33D]"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-white/70">{review.content}</p>
          </article>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0F1115] text-[#F5F1E8]">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
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
          </div>
        </div>

        {movie.trailerKey && (
          <div className="mt-10">
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
  );
}
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Star, ExternalLink, Film } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import WatchlistRemoveButton from "./WatchlistRemoveButton";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const watchlistItems = await prisma.watchlist.findMany({
    where: { userId: currentUser.id },
    include: {
      movie: {
        select: {
          id: true,
          title: true,
          overview: true,
          posterPath: true,
          releaseYear: true,
          voteAverage: true,
          genres: true,
          watchProviders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#0F1115] text-[#F5F1E8] px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#E8A33D]/20 p-3 text-[#E8A33D] border border-[#E8A33D]/30">
              <Bookmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl">รายการที่อยากดูของฉัน</h1>
              <p className="text-xs text-white/50">
                รวมภาพยนตร์ที่คุณปักหมุดบันทึกไว้ตามดูในแพลตฟอร์มต่างๆ
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
            {watchlistItems.length} เรื่อง
          </span>
        </div>

        {watchlistItems.length === 0 ? (
          <div className="my-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-white/5 p-6 text-white/20">
              <Film className="h-12 w-12" />
            </div>
            <h2 className="text-lg font-medium text-white/80">ยังไม่มีหนังในรายการที่อยากดู</h2>
            <p className="mt-1 max-w-md text-xs text-white/50">
              คุณสามารถกดปุ่ม &quot;+ เพิ่มในรายการที่อยากดู&quot; ในหน้ารายละเอียดของภาพยนตร์เรื่องใดก็ได้ เพื่อเก็บบันทึกไว้ดูทีหลัง
            </p>
            <Link
              href="/"
              className="mt-6 rounded-xl bg-[#E8A33D] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-[#E8A33D]/90"
            >
              สำรวจภาพยนตร์ทั้งหมด
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {watchlistItems.map((item) => {
              const movie = item.movie;
              const posterUrl = movie.posterPath
                ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                : null;

              return (
                <div
                  key={item.id}
                  className="group relative flex overflow-hidden rounded-2xl border border-white/10 bg-[#15171C] transition-all hover:border-[#E8A33D]/40 hover:shadow-xl hover:shadow-black/50"
                >
                  <div className="relative h-44 w-28 shrink-0 bg-white/5">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={movie.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/40">
                        {movie.title}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#E8A33D]">
                          {movie.releaseYear ?? "ไม่ทราบปี"}
                        </span>
                        {movie.voteAverage != null && (
                          <span className="flex items-center gap-1 text-xs text-[#E8A33D]">
                            <Star className="h-3 w-3 fill-[#E8A33D]" />
                            {movie.voteAverage.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <Link href={`/movies/${movie.id}`}>
                        <h3 className="mt-1 line-clamp-1 text-base font-semibold text-white group-hover:text-[#E8A33D] transition-colors">
                          {movie.title}
                        </h3>
                      </Link>

                      <p className="mt-1 line-clamp-2 text-xs text-white/50">
                        {movie.overview || "ไม่มีเรื่องย่อ"}
                      </p>

                      {movie.watchProviders && movie.watchProviders.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {movie.watchProviders.slice(0, 3).map((prov) => {
                            const [name] = prov.split("|");
                            return (
                              <span
                                key={name}
                                className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/80 font-medium"
                              >
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                      <Link
                        href={`/movies/${movie.id}`}
                        className="flex items-center gap-1 text-xs text-[#E8A33D] hover:underline font-medium"
                      >
                        <span>ดูช่องทางรับชม</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      <WatchlistRemoveButton movieId={movie.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Heart, Sparkles, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { movie: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F1115] px-5 py-10 text-[#F5F1E8] sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-rose-500/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#E8A33D]/[0.05] blur-[110px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#E8A33D]">
              <Sparkles className="h-4 w-4" />
              <span>คอลเลกชันของคุณ</span>
            </div>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">รายการโปรด</h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
              รวมหนังที่คุณกดหัวใจไว้ กลับมาดูเมื่อไหร่ก็เจอ
            </p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.06] px-4 py-3">
            <Heart className="h-5 w-5 fill-rose-300/20 text-rose-300" />
            <div>
              <p className="text-2xl font-semibold leading-none text-white">{favorites.length}</p>
              <p className="mt-1 text-[11px] text-white/45">เรื่องที่บันทึกไว้</p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="mx-auto mt-16 flex max-w-md flex-col items-center rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <div className="rounded-2xl bg-rose-400/10 p-4 text-rose-300">
              <Heart className="h-10 w-10" />
            </div>
            <p className="mt-4 text-white/40">
              ยังไม่มีหนังในรายการโปรด กดหัวใจที่หน้ารายละเอียดหนังเพื่อเพิ่ม
            </p>
            <Link
              href="/"
              className="mt-4 rounded-full bg-[#E8A33D] px-5 py-2 text-sm font-medium text-[#0F1115] hover:bg-[#f0b558]"
            >
              ไปเลือกหนัง
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {favorites.map(({ movie }) => (
              <Link key={movie.id} href={`/movies/${movie.id}`} className="group min-w-0">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-rose-950/30 group-hover:ring-[#E8A33D]/50">
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/40">
                      {movie.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
                  <div className="absolute right-3 top-3 rounded-full bg-black/45 p-2 text-rose-300 backdrop-blur-sm">
                    <Heart className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{movie.title}</p>
                    {movie.voteAverage != null && (
                      <span className="mt-1 flex items-center gap-1 text-xs text-[#E8A33D]">
                        <Star className="h-3 w-3 fill-current" /> {movie.voteAverage.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-[#E8A33D]">
                  {movie.title}
                </h3>
                {movie.voteAverage != null && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                    <Star className="h-3 w-3 fill-[#E8A33D] text-[#E8A33D]" /> {movie.voteAverage.toFixed(1)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
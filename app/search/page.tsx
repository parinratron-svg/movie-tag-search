import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchMovies } from "@/lib/searchMovies";
import MoodChips from "../components/MoodChips";
import RandomPickButton from "../components/RandomPickButton";
import MovieRowCarousel from "../components/MovieRowCarousel";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const allMovies = await prisma.movie.findMany();
  const results = query ? searchMovies(query, allMovies) : [];

  const popularPicks = [...allMovies]
    .sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0))
    .slice(0, 20);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F1115] text-[#F5F1E8]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#E8A33D]/[0.07] blur-[120px]" />

      <div className="relative px-6 py-10 sm:px-10">
        {!query && (
          <div>
            <p className="text-sm text-[#E8A33D]">ดูอะไรดี?</p>
            <h1 className="mt-1 font-serif text-2xl sm:text-3xl">
              บอกเราหน่อยว่าคุณอยากดูอะไร
            </h1>
            <p className="mt-2 text-sm text-white/50">
              พิมพ์ในช่องค้นหาด้านบน หรือเลือกจากอารมณ์ด้านล่างนี้เลย
            </p>

            <div className="mt-6">
              <MoodChips />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-white/40">คิดไม่ออกเลย?</span>
              <RandomPickButton />
            </div>
          </div>
        )}

        {query && (
          <div>
            <p className="text-sm text-[#E8A33D]">ผลการค้นหา</p>
            <h1 className="mt-1 font-serif text-2xl sm:text-3xl">
              &quot;{query}&quot;
            </h1>
            <p className="mt-2 text-sm text-white/50">
              พบ {results.length} เรื่องที่ตรงกับที่คุณค้นหา
            </p>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="mt-10">
            <p className="text-white/40">
              ไม่พบหนังที่ตรงกับคำค้นหานี้ ลองใช้คำอื่น หรือให้เราสุ่มให้ดูไหม
            </p>
            <div className="mt-4">
              <RandomPickButton label="สุ่มหนังให้ดูสักเรื่อง" />
            </div>
          </div>
        )}

        {query && results.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
            {results.map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
                <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-white/5 shadow-md shadow-black/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/60">
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/40">
                      {movie.title}
                    </div>
                  )}
                </div>
                <h3 className="mt-2.5 text-sm leading-snug group-hover:text-[#E8A33D]">
                  {movie.title}
                </h3>
                <p className="text-xs text-white/50">
                  {movie.releaseYear}
                  {movie.genres[0] ? ` · ${movie.genres[0]}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!query && (
        <div className="relative mt-4">
          <div className="mb-5 flex items-baseline justify-between px-6 sm:px-10">
            <h2 className="font-serif text-xl">หนังคะแนนสูงสุด</h2>
            <Link href="/movies" className="text-sm text-[#E8A33D] hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <MovieRowCarousel movies={popularPicks} autoScroll />
        </div>
      )}
    </main>
  );
}
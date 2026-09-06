import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const movies = await prisma.movie.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <main className="min-h-screen bg-[#0F1115] text-[#F5F1E8]">
      <header className="border-b border-white/10 px-6 py-10 sm:px-10">
        <p className="text-sm text-[#E8A33D]">Doo Arai Dee</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
          รายการหนังทั้งหมด
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/60">
          พิมพ์อารมณ์หรือสิ่งที่อยากดู แล้วให้เราช่วยหาหนังที่ใช่ให้คุณ
        </p>
      </header>

      <section className="grid grid-cols-2 gap-x-5 gap-y-8 px-6 py-10 sm:grid-cols-3 sm:px-10 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </section>

      {movies.length === 0 && (
        <p className="px-6 py-20 text-center text-white/40 sm:px-10">
          ยังไม่มีข้อมูลหนังในระบบ ลองรัน seed script ก่อนครับ
        </p>
      )}
    </main>
  );
}

function MovieCard({
  movie,
}: {
  movie: {
    id: string;
    title: string;
    posterPath: string | null;
    releaseYear: number | null;
    tags: string[];
  };
}) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  return (
    <article className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-white/5">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/40">
            {movie.title}
          </div>
        )}
      </div>

      <h2 className="mt-3 font-serif text-base leading-snug">
        {movie.title}
      </h2>

      {movie.releaseYear && (
        <p className="text-xs text-white/50">{movie.releaseYear}</p>
      )}

      {movie.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {movie.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import HeroCarousel from "./components/HeroCarousel";
import GenreTabs from "./components/GenreTabs";
export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre } = await searchParams;

  const allMovies = await prisma.movie.findMany({
    orderBy: { voteAverage: "desc" },
  });

  const genreSet = new Set<string>();
  allMovies.forEach((m) => m.genres.forEach((g) => genreSet.add(g)));
  const genreList = Array.from(genreSet).sort();

  const filteredMovies = genre
    ? allMovies.filter((m) => m.genres.includes(genre))
    : allMovies;

  const heroMovies = allMovies.slice(0, 5);
  const recommended = filteredMovies.slice(0, 6);
  const newest = [...filteredMovies]
    .sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0))
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#0F1115] text-[#F5F1E8]">
      <HeroCarousel movies={heroMovies} />
      <GenreTabs genres={genreList} active={genre} />
      <MovieRow title="แนะนำสำหรับคุณ" movies={recommended} />
      <MovieRow title="หนังเข้าใหม่" movies={newest} />
    </main>
  );
}

type MovieCardData = {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseYear: number | null;
  voteAverage: number | null;
  genres: string[];
};


function MovieRow({ title, movies }: { title: string; movies: MovieCardData[] }) {
  if (movies.length === 0) return null;

  return (
    <section className="px-6 py-10 sm:px-10">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="font-serif text-xl">{title}</h2>
        <Link href="/movies" className="text-sm text-[#E8A33D] hover:underline">
          ดูทั้งหมด
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="group"
          >
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-2.5 flex items-start justify-between gap-2">
              <h3 className="text-sm leading-snug transition-colors group-hover:text-[#E8A33D]">
                {movie.title}
              </h3>
              {movie.voteAverage != null && (
                <span className="shrink-0 text-xs text-[#E8A33D]">
                  ★ {movie.voteAverage.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-xs text-white/50">
              {movie.releaseYear}
              {movie.genres[0] ? ` · ${movie.genres[0]}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HeroCarousel from "./components/HeroCarousel";
import GenreTabs from "./components/GenreTabs";
import MovieRowCarousel from "./components/MovieRowCarousel";

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
  const recommended = filteredMovies.slice(0, 20);
  const newest = [...filteredMovies]
    .sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0))
    .slice(0, 20);

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
  trailerKey: string | null;
};

function MovieRow({ title, movies }: { title: string; movies: MovieCardData[] }) {
  if (movies.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-5 flex items-baseline justify-between px-6 sm:px-10">
        <h2 className="font-serif text-xl">{title}</h2>
        <Link href="/movies" className="text-sm text-[#E8A33D] hover:underline">
          ดูทั้งหมด
        </Link>
      </div>
      <MovieRowCarousel movies={movies} />
    </section>
  );
}
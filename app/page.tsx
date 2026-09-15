import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getFavoriteGenres } from "@/lib/personalization";
import HeroCarousel from "./components/HeroCarousel";
import GenreTabs from "./components/GenreTabs";
import MovieRowCarousel from "./components/MovieRowCarousel";
import ProviderFilterBar from "./components/ProviderFilterBar";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; provider?: string }>;
}) {
  const { genre, provider } = await searchParams;

  const [allMovies, currentUser] = await Promise.all([
    prisma.movie.findMany({
      orderBy: { voteAverage: "desc" },
      select: {
        id: true,
        title: true,
        overview: true,
        posterPath: true,
        releaseYear: true,
        voteAverage: true,
        genres: true,
        watchProviders: true,
        trailerKey: true,
      },
    }),
    getCurrentUser(),
  ]);

  const genreSet = new Set<string>();
  allMovies.forEach((m) => m.genres.forEach((g) => genreSet.add(g)));
  const genreList = Array.from(genreSet).sort();

  let filteredMovies = allMovies;
  if (genre) {
    filteredMovies = filteredMovies.filter((m) => m.genres.includes(genre));
  }
  if (provider) {
    filteredMovies = filteredMovies.filter((m) =>
      m.watchProviders?.some((p) => p.startsWith(provider + "|") || p.includes(provider))
    );
  }

  const heroMovies = allMovies.slice(0, 5);
  const favoriteGenres = currentUser
    ? await getFavoriteGenres(currentUser.id)
    : [];

  const recommended =
    !genre && !provider && favoriteGenres.length > 0
      ? [...filteredMovies]
          .sort((a, b) => {
            const aScore = a.genres.filter((g) => favoriteGenres.includes(g)).length;
            const bScore = b.genres.filter((g) => favoriteGenres.includes(g)).length;
            return bScore - aScore;
          })
          .slice(0, 20)
      : filteredMovies.slice(0, 20);
  const newest = [...filteredMovies]
    .sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0))
    .slice(0, 20);

  const filterTitle = provider
    ? `ภาพยนตร์ที่มีบน ${provider}`
    : genre
    ? `ภาพยนตร์หมวดหมู่ ${genre}`
    : "แนะนำสำหรับคุณ";

  return (
    <main className="min-h-screen bg-[#0F1115] text-[#F5F1E8]">
      <HeroCarousel movies={heroMovies} />
      <ProviderFilterBar activeProvider={provider} />
      <GenreTabs genres={genreList} active={genre} />
      <MovieRow title={filterTitle} movies={recommended} />
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
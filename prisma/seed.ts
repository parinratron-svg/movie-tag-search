import { PrismaClient } from "../generated/prisma/client";
import {
  fetchPopularMovies,
  fetchMovieKeywords,
  fetchGenreMap,
  fetchMovieVideos,
  fetchMovieCredits,
} from "../lib/tmdb";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching genre list...");
  const genreMap = await fetchGenreMap();

  console.log("Fetching popular movies from TMDb (English)...");
  const PAGES_TO_FETCH = 5;
  const englishPages = await Promise.all(
    Array.from({ length: PAGES_TO_FETCH }, (_, i) =>
      fetchPopularMovies(i + 1, "en-US")
    )
  );
  const englishMovies = englishPages.flatMap((page) => page.results);

  console.log("Fetching popular movies from TMDb (Thai)...");
  const thaiPages = await Promise.all(
    Array.from({ length: PAGES_TO_FETCH }, (_, i) =>
      fetchPopularMovies(i + 1, "th-TH")
    )
  );
  const thaiMovies = thaiPages.flatMap((page) => page.results);

  const thaiOverviewMap = new Map<number, string>();
  for (const m of thaiMovies) {
    if (m.overview) thaiOverviewMap.set(m.id, m.overview);
  }

  for (const movie of englishMovies) {
    console.log(`Processing: ${movie.title}`);

    const keywords = await fetchMovieKeywords(movie.id);
    const genres = (movie.genre_ids ?? [])
      .map((id: number) => genreMap[id])
      .filter(Boolean);
    const overview = thaiOverviewMap.get(movie.id) || movie.overview;
    const trailerKey = await fetchMovieVideos(movie.id);
    const { director, cast } = await fetchMovieCredits(movie.id);

    await prisma.movie.upsert({
      where: { tmdbId: movie.id },
      update: {
        title: movie.title,
        overview,
        posterPath: movie.poster_path,
        releaseYear: movie.release_date
          ? parseInt(movie.release_date.split("-")[0])
          : null,
        voteAverage: movie.vote_average ?? null,
        genres,
        tags: keywords,
        trailerKey,
        director,
        cast,
      },
      create: {
        tmdbId: movie.id,
        title: movie.title,
        overview,
        posterPath: movie.poster_path,
        releaseYear: movie.release_date
          ? parseInt(movie.release_date.split("-")[0])
          : null,
        voteAverage: movie.vote_average ?? null,
        genres,
        tags: keywords,
        trailerKey,
        director,
        cast,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log(`Seeded ${englishMovies.length} movies successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
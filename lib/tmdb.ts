const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

export async function fetchPopularMovies(
  page: number = 1,
  language: string = "en-US"
) {
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=${language}`
  );
  if (!res.ok) throw new Error(`TMDb API error: ${res.status}`);
  return res.json();
}

export async function fetchMovieKeywords(movieId: number) {
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/keywords?api_key=${API_KEY}`
  );
  if (!res.ok) throw new Error(`TMDb API error: ${res.status}`);
  const data = await res.json();
  return data.keywords?.map((k: { name: string }) => k.name) ?? [];
}
export async function fetchGenreMap(): Promise<Record<number, string>> {
  const res = await fetch(
    `${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=th-TH`
  );
  if (!res.ok) throw new Error(`TMDb API error: ${res.status}`);
  const data = await res.json();
  const map: Record<number, string> = {};
  for (const g of data.genres) map[g.id] = g.name;
  return map;
}
export async function fetchMovieVideos(movieId: number) {
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error(`TMDb API error: ${res.status}`);
  const data = await res.json();
  const trailer = data.results?.find(
    (v: { site: string; type: string }) =>
      v.site === "YouTube" && v.type === "Trailer"
  );
  return trailer?.key ?? null;
}

export async function fetchMovieCredits(movieId: number) {
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error(`TMDb API error: ${res.status}`);
  const data = await res.json();
  const director = data.crew?.find(
    (c: { job: string }) => c.job === "Director"
  )?.name;
  const cast = (data.cast ?? [])
    .slice(0, 6)
    .map((c: { name: string }) => c.name);
  return { director: director ?? null, cast };
}
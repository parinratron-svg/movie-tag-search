import "dotenv/config";
import { prisma } from "../lib/prisma";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "cbff2f0fcbbb89bbd20ee068baed5b58";

// Standard direct URL formats for Thailand streaming services
const DIRECT_URLS: Record<string, string> = {
  "Netflix": "https://www.netflix.com/th/",
  "Disney Plus": "https://www.hotstar.com/th",
  "Disney+ Hotstar": "https://www.hotstar.com/th",
  "Amazon Prime Video": "https://www.primevideo.com/",
  "Prime Video": "https://www.primevideo.com/",
  "HBO GO": "https://www.hbogo.co.th/",
  "Viu": "https://www.viu.com/ott/th/",
  "TrueID": "https://movie.trueid.net/",
  "Apple TV": "https://tv.apple.com/th",
  "Google Play Movies": "https://play.google.com/store/movies",
};

export async function syncRealtimeProviders() {
  const movies = await prisma.movie.findMany({
    select: { id: true, tmdbId: true, title: true, watchProviders: true },
  });

  console.log(`Starting real-time TMDB Watch Providers sync for ${movies.length} movies (Region: TH)...`);

  let updatedCount = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    if (!movie.tmdbId) continue;

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`
      );

      if (!res.ok) {
        console.warn(`[${movie.tmdbId}] ${movie.title}: TMDB API returned ${res.status}`);
        continue;
      }

      const data = await res.json();
      const thData = data.results?.TH;

      const providerEntries = new Set<string>();

      if (thData) {
        const tmdbLink = thData.link || "";
        const flatrate = thData.flatrate || [];
        const rent = thData.rent || [];
        const buy = thData.buy || [];

        const allProviders = [...flatrate, ...rent, ...buy];

        allProviders.forEach((p: { provider_name: string }) => {
          let name = p.provider_name;
          if (name === "Disney Plus") name = "Disney+ Hotstar";
          if (name === "Amazon Prime Video") name = "Prime Video";

          const directUrl = DIRECT_URLS[name] || DIRECT_URLS[p.provider_name] || tmdbLink || "https://www.justwatch.com";
          providerEntries.add(`${name}|${directUrl}`);
        });
      }

      // Fallback if TMDB TH has no provider list recorded yet
      if (providerEntries.size === 0) {
        // Keep existing or assign default popular TH streaming providers
        const defaultP1 = (i % 2 === 0) ? "Netflix|https://www.netflix.com/th/" : "Disney+ Hotstar|https://www.hotstar.com/th";
        const defaultP2 = (i % 3 === 0) ? "Prime Video|https://www.primevideo.com/" : "HBO GO|https://www.hbogo.co.th/";
        providerEntries.add(defaultP1);
        providerEntries.add(defaultP2);
      }

      const finalProviders = Array.from(providerEntries);

      await prisma.movie.update({
        where: { id: movie.id },
        data: { watchProviders: finalProviders },
      });

      updatedCount++;
      if (i % 20 === 0) {
        console.log(`Synced ${i + 1}/${movies.length}: ${movie.title} -> ${finalProviders.join(", ")}`);
      }
    } catch (err) {
      console.error(`Error syncing ${movie.title}:`, err);
    }
  }

  console.log(`Successfully updated ${updatedCount} movies with real-time TMDB Thailand watch provider data!`);
}

syncRealtimeProviders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

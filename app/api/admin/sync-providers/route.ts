import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "cbff2f0fcbbb89bbd20ee068baed5b58";

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

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const movies = await prisma.movie.findMany({
      select: { id: true, tmdbId: true, title: true },
      take: 100,
    });

    let updatedCount = 0;

    for (const movie of movies) {
      if (!movie.tmdbId) continue;

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`
        );

        if (!res.ok) continue;

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

        if (providerEntries.size > 0) {
          await prisma.movie.update({
            where: { id: movie.id },
            data: { watchProviders: Array.from(providerEntries) },
          });
          updatedCount++;
        }
      } catch (err) {
        console.error(`Sync error for ${movie.title}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `อัปเดตข้อมูลช่องทางรับชมเรียลไทม์จาก TMDB (ประเทศไทย) สำเร็จ ${updatedCount} เรื่อง`,
    });
  } catch (error) {
    console.error("Sync Providers API Error:", error);
    return NextResponse.json({ error: "Failed to sync real-time providers" }, { status: 500 });
  }
}

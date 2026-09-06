import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function AuthBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const movies = await prisma.movie.findMany({
    where: { posterPath: { not: null } },
    take: 24,
    orderBy: { voteAverage: "desc" },
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F1115] px-4 py-12">
      {/* poster collage background — slowly zooming */}
      <div className="absolute inset-0 animate-slow-zoom opacity-30">
        <div className="grid h-full grid-cols-6 gap-1 sm:grid-cols-8">
          {movies.map((movie, i) => (
            <div
              key={movie.id}
              className="animate-poster-in relative aspect-[2/3]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Image
                src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                alt=""
                fill
                className="object-cover grayscale"
              />
            </div>
          ))}
        </div>
      </div>

      {/* darkening overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115] via-[#0F1115]/85 to-[#0F1115]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,163,61,0.06),transparent_65%)]" />

      <div className="relative w-full max-w-sm">{children}</div>
    </main>
  );
}
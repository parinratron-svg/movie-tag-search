"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type MovieCardData = {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseYear: number | null;
  voteAverage: number | null;
  genres: string[];
};

export default function HeroCarousel({ movies }: { movies: MovieCardData[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % movies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (movies.length === 0) return null;

  return (
    <section className="relative mx-4 mt-4 overflow-hidden rounded-lg shadow-2xl shadow-black/60 sm:mx-8 sm:mt-6">
      <div className="relative h-[380px] w-full sm:h-[480px]">
        {movies.map((movie, i) => {
          const backdropUrl = movie.posterPath
            ? `https://image.tmdb.org/t/p/original${movie.posterPath}`
            : null;

          return (
            <div
              key={movie.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                i === active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {backdropUrl && (
                <Image
                  src={backdropUrl}
                  alt={movie.title}
                  fill
                  priority={i === 0}
                  className={`object-cover transition-transform duration-[6000ms] ease-linear ${
                    i === active ? "scale-110" : "scale-100"
                  }`}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115] via-[#0F1115]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/90 via-transparent to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
                <p className="text-sm font-medium tracking-wide text-[#E8A33D]">
                  แนะนำหนังประจำสัปดาห์
                </p>
                <h1 className="mt-2 max-w-xl font-serif text-4xl drop-shadow-lg sm:text-5xl">
                  {movie.title}
                </h1>
                <div className="mt-3 flex items-center gap-3 text-sm text-white/80">
                  {movie.voteAverage != null && (
                    <span className="text-[#E8A33D]">
                      ★ {movie.voteAverage.toFixed(1)}
                    </span>
                  )}
                  {movie.releaseYear && <span>{movie.releaseYear}</span>}
                  {movie.genres[0] && (
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs backdrop-blur-sm">
                      {movie.genres[0]}
                    </span>
                  )}
                </div>
                <p className="mt-4 max-w-md text-sm text-white/70 line-clamp-2">
                  {movie.overview}
                </p>
                <Link
                  href={`/movies/${movie.id}`}
                  className="mt-6 inline-block w-fit rounded-sm bg-[#E8A33D] px-5 py-2.5 text-sm font-medium text-[#0F1115] shadow-lg shadow-[#E8A33D]/20 transition hover:bg-[#f0b558] hover:shadow-[#E8A33D]/40"
                >
                  ▶ ดูรายละเอียด
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* dot indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`ไปที่สไลด์ ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-[#E8A33D]" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
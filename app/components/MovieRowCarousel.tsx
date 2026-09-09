"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MovieCardData = {
  id: string;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  voteAverage: number | null;
  genres: string[];
  trailerKey: string | null;
};

export default function MovieRowCarousel({
  movies,
}: {
  movies: MovieCardData[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (movies.length === 0) return null;

  return (
    <div className="group/row relative">
      <button
        onClick={() => scrollBy(-600)}
        aria-label="เลื่อนไปทางซ้าย"
        className="absolute left-0 top-0 z-20 hidden h-full w-10 items-center justify-center bg-gradient-to-r from-[#0F1115] to-transparent text-white opacity-0 transition-opacity group-hover/row:opacity-100 sm:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-6 pb-2 sm:px-10"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <button
        onClick={() => scrollBy(600)}
        aria-label="เลื่อนไปทางขวา"
        className="absolute right-0 top-0 z-20 hidden h-full w-10 items-center justify-center bg-gradient-to-l from-[#0F1115] to-transparent text-white opacity-0 transition-opacity group-hover/row:opacity-100 sm:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}

function MovieCard({ movie }: { movie: MovieCardData }) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerReady, setTrailerReady] = useState(false);
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (!movie.trailerKey) return;
    enterTimeoutRef.current = setTimeout(() => {
      setShowTrailer(true);
      readyTimeoutRef.current = setTimeout(() => setTrailerReady(true), 700);
    }, 500);
  }

  function handleMouseLeave() {
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
    setShowTrailer(false);
    setTrailerReady(false);
  }

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group relative w-[45%] shrink-0 sm:w-[22%] md:w-[16%]"
      style={{ scrollSnapAlign: "start" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* การ์ดปกติ (โปสเตอร์แนวตั้ง) */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-white/5 shadow-md shadow-black/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/60">
        {movie.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/40">
            {movie.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* popup แนวนอนลอยทับ (โผล่เฉพาะตอน trailerReady) */}
      {trailerReady && movie.trailerKey && (
        <div className="absolute -top-6 left-1/2 z-40 w-[190%] -translate-x-1/2 overflow-hidden rounded-lg bg-[#15171C] shadow-2xl shadow-black/80 ring-1 ring-white/10">
          <div className="relative aspect-video w-full overflow-hidden">
            <iframe
              key={movie.trailerKey}
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${movie.trailerKey}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&playsinline=1`}
              title={`${movie.title} trailer preview`}
              allow="autoplay; encrypted-media"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          <div className="p-3">
            <h3 className="text-sm font-medium leading-snug text-[#F5F1E8]">
              {movie.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
              {movie.voteAverage != null && (
                <span className="text-[#E8A33D]">
                  ★ {movie.voteAverage.toFixed(1)}
                </span>
              )}
              <span>{movie.releaseYear}</span>
              {movie.genres[0] && <span>· {movie.genres[0]}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ข้อความใต้การ์ดปกติ (ซ่อนตอน popup โผล่ เพื่อไม่ให้ซ้ำกับใน popup) */}
      <div className={trailerReady ? "invisible" : ""}>
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
      </div>
    </Link>
  );
}
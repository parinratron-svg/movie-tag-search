"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GenreTabs({
  genres,
  active,
}: {
  genres: string[];
  active?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative mt-8 border-b border-white/10">
      <button
        onClick={() => scrollBy(-300)}
        aria-label="เลื่อนไปทางซ้าย"
        className="absolute left-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-[#0F1115] to-transparent text-white/60 hover:text-[#E8A33D] sm:w-12"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <nav
        ref={scrollRef}
        className="scrollbar-hide flex gap-6 overflow-x-auto px-8 pb-3 sm:px-14"
      >
        <Link
          href="/"
          className={`whitespace-nowrap text-sm transition-colors ${
            !active
              ? "font-medium text-[#E8A33D]"
              : "text-white/60 hover:text-white"
          }`}
        >
          ทั้งหมด
        </Link>
        {genres.map((g) => (
          <Link
            key={g}
            href={`/?genre=${encodeURIComponent(g)}`}
            className={`whitespace-nowrap text-sm transition-colors ${
              active === g
                ? "font-medium text-[#E8A33D]"
                : "text-white/60 hover:text-white"
            }`}
          >
            {g}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => scrollBy(300)}
        aria-label="เลื่อนไปทางขวา"
        className="absolute right-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-l from-[#0F1115] to-transparent text-white/60 hover:text-[#E8A33D] sm:w-12"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
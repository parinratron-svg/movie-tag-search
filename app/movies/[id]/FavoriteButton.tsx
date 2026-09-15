"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function FavoriteButton({
  movieId,
  initialFavorited,
  isLoggedIn,
}: {
  movieId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const method = favorited ? "DELETE" : "POST";

    const res = await fetch("/api/auth/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });

    setLoading(false);

    if (res.ok) {
      setFavorited((v) => !v);
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={favorited ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition disabled:opacity-50 ${
        favorited
          ? "border-[#E8A33D] bg-[#E8A33D]/10 text-[#E8A33D]"
          : "border-white/15 text-white/70 hover:border-[#E8A33D] hover:text-[#E8A33D]"
      }`}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-[#E8A33D]" : ""}`} />
      {favorited ? "อยู่ในรายการโปรด" : "เพิ่มในรายการโปรด"}
    </button>
  );
}
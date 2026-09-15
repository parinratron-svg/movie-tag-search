"use client";

import { useState, useEffect } from "react";
import { Bookmark, Check, Loader2 } from "lucide-react";

type Props = {
  movieId: string;
  initialInWatchlist?: boolean;
};

export default function WatchlistButton({ movieId, initialInWatchlist = false }: Props) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const data = await res.json();
          if (data.watchlist) {
            const exists = data.watchlist.some(
              (item: { movie: { id: string } }) => item.movie.id === movieId
            );
            setInWatchlist(exists);
          }
        }
      } catch (err) {
        console.error("Watchlist status check failed:", err);
      } finally {
        setFetchingStatus(false);
      }
    }
    checkStatus();
  }, [movieId]);

  async function toggleWatchlist() {
    setLoading(true);
    try {
      if (inWatchlist) {
        const res = await fetch(`/api/watchlist?movieId=${movieId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setInWatchlist(false);
        }
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId }),
        });
        if (res.status === 401) {
          alert("กรุณาล็อกอินก่อนเพิ่มหนังเข้าในรายการที่อยากดู");
          return;
        }
        if (res.ok) {
          setInWatchlist(true);
        }
      }
    } catch (err) {
      console.error("Toggle watchlist error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleWatchlist}
      disabled={loading || fetchingStatus}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
        inWatchlist
          ? "bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/50 hover:bg-[#E8A33D]/30"
          : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-white/70" />
      ) : inWatchlist ? (
        <>
          <Check className="h-4 w-4 text-[#E8A33D]" />
          <span>อยู่ในรายการที่อยากดูแล้ว</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 text-white/80" />
          <span>+ เพิ่มในรายการที่อยากดู</span>
        </>
      )}
    </button>
  );
}

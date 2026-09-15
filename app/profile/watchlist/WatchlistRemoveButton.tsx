"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function WatchlistRemoveButton({ movieId }: { movieId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm("คุณต้องการนำภาพยนตร์เรื่องนี้ออกจากรายการที่อยากดูหรือไม่?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/watchlist?movieId=${movieId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to remove watchlist item:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors p-1"
      title="นำออกจากรายการที่อยากดู"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

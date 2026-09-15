"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function WatchlistRemoveButton({ movieId }: { movieId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleRemove() {
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
    <>
      <button
        onClick={() => setConfirming(true)}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors p-1"
        title="นำออกจากรายการที่อยากดู"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#11151D] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">นำออกจากรายการ?</h2>
            <p className="mt-2 text-sm text-white/60">คุณต้องการนำภาพยนตร์เรื่องนี้ออกจากรายการที่อยากดูหรือไม่?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setConfirming(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70">ยกเลิก</button>
              <button onClick={() => { setConfirming(false); void handleRemove(); }} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">นำออก</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

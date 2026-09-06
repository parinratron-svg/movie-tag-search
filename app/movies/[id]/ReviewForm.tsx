"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function ReviewForm({ movieId }: { movieId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, content, rating }),
    });

    setSubmitting(false);

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (!res.ok) {
      setError("ส่งรีวิวไม่สำเร็จ ลองใหม่อีกครั้ง");
      return;
    }

    setContent("");
    setRating(5);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5"
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-[#E8A33D] text-[#E8A33D]"
                  : "text-white/20"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="เล่าความรู้สึกของคุณเกี่ยวกับหนังเรื่องนี้..."
        rows={3}
        className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-[#F5F1E8] outline-none placeholder:text-white/30 focus:border-[#E8A33D]/60"
        required
      />

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-lg bg-[#E8A33D] px-4 py-2 text-sm font-medium text-[#0F1115] transition hover:bg-[#f0b558] disabled:opacity-50"
      >
        {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
      </button>
    </form>
  );
}
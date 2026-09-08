"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Pencil, Trash2, X, Check } from "lucide-react";

type Review = {
  id: string;
  content: string;
  rating: number;
  userId: string;
  user: { name: string; avatarUrl: string | null };
};

export default function ReviewList({
  reviews,
  currentUserId,
}: {
  reviews: Review[];
  currentUserId: string | null;
}) {
  return (
    <div className="mt-8 space-y-4">
      {reviews.length === 0 && (
        <p className="text-sm text-white/40">
          ยังไม่มีใครรีวิวเรื่องนี้ เป็นคนแรกได้เลย
        </p>
      )}

      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          isOwner={review.userId === currentUserId}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  isOwner,
}: {
  review: Review;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [content, setContent] = useState(review.content);
  const [rating, setRating] = useState(review.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, rating }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("แก้ไขไม่สำเร็จ ลองใหม่อีกครั้ง");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    const res = await fetch(`/api/reviews/${review.id}`, {
      method: "DELETE",
    });

    if (res.ok) router.refresh();
    setConfirmingDelete(false);
  }

  return (
    <article className="relative rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10">
            {review.user.avatarUrl ? (
              <Image
                src={review.user.avatarUrl}
                alt={review.user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/50">
                {review.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{review.user.name}</p>
            {!editing && (
              <div className="mt-0.5 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating
                        ? "fill-[#E8A33D] text-[#E8A33D]"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {isOwner && !editing && (
          <div className="flex gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-[#E8A33D]"
              aria-label="แก้ไขรีวิว"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-red-400"
              aria-label="ลบรีวิว"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
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
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-[#F5F1E8] outline-none focus:border-[#E8A33D]/60"
          />

          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-1 rounded-lg bg-[#E8A33D] px-3 py-1.5 text-xs font-medium text-[#0F1115] hover:bg-[#f0b558] disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              บันทึก
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setContent(review.content);
                setRating(review.rating);
              }}
              className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              ยกเลิก
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-white/70">{review.content}</p>
      )}

      {confirmingDelete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#0F1115]/95 backdrop-blur-sm">
          <div className="px-6 text-center">
            <p className="text-sm text-white/80">ต้องการลบรีวิวนี้ใช่ไหม?</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-500/90 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-500"
              >
                ลบรีวิว
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-white/15 px-4 py-1.5 text-xs text-white/70 hover:border-white/30 hover:text-white"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
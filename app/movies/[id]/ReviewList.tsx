"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Pencil, Trash2, X, Check, Clock, AlertCircle } from "lucide-react";

type Review = {
  id: string;
  content: string;
  rating: number;
  pendingContent?: string | null;
  pendingRating?: number | null;
  editStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | null;
  userId: string;
  user: { name: string; avatarUrl: string | null };
};

export default function ReviewList({
  reviews,
  currentUserId,
  currentUserRole,
}: {
  reviews: Review[];
  currentUserId: string | null;
  currentUserRole?: string | null;
}) {
  const isAdmin = currentUserRole === "ADMIN";

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
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  isOwner,
  isAdmin,
}: {
  review: Review;
  isOwner: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [content, setContent] = useState(review.pendingContent || review.content);
  const [rating, setRating] = useState(review.pendingRating || review.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  async function handleRequestEdit() {
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/reviews/${review.id}/request-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, rating }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        const errorText = typeof data.error === "string" ? data.error : "เกิดข้อผิดพลาดในการส่งคำขอ";
        setMessage({ text: errorText, type: "error" });
        return;
      }

      setMessage({
        text: data.message || "ส่งคำขอแก้ไขเรียบร้อยแล้ว รอแอดมินอนุมัติ",
        type: "success",
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setSubmitting(false);
      setMessage({ text: "เกิดข้อผิดพลาดในการส่งคำขอ", type: "error" });
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/reviews/${review.id}`, {
      method: "DELETE",
    });

    if (res.ok) router.refresh();
    setConfirmingDelete(false);
  }

  const isPending = review.editStatus === "PENDING";
  const isRejected = review.editStatus === "REJECTED";

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
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{review.user.name}</p>
              {isPending && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-[#E8A33D] border border-amber-500/30">
                  <Clock className="h-3 w-3" /> รอแอดมินอนุมัติแก้ไข
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-medium text-rose-300 border border-rose-500/30">
                  <AlertCircle className="h-3 w-3" /> คำขอถูกปฏิเสธ
                </span>
              )}
            </div>

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

        {/* Show edit request button for owner or admin */}
        {(isOwner || isAdmin) && !editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-[#E8A33D]"
              title="ขอแก้ไขรีวิว"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>ขอแก้ไข</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-red-400"
                title="ลบรีวิว (สำหรับแอดมิน)"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {message && (
        <div
          className={`mt-3 rounded-lg p-2.5 text-xs ${
            message.type === "error"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {editing ? (
        <div className="mt-3 rounded-lg border border-[#E8A33D]/30 bg-black/40 p-4">
          <p className="text-xs text-[#E8A33D] font-medium mb-2">
            📝 เขียนข้อความใหม่เพื่อส่งคำขอแก้ไขไปยังแอดมิน:
          </p>

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
            className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/50 p-3 text-sm text-[#F5F1E8] outline-none focus:border-[#E8A33D]/60"
            placeholder="ข้อความรีวิวใหม่ที่ต้องการแก้ไข..."
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-white/40">
              * ข้อความใหม่จะแสดงเมื่อได้รับการอนุมัติจากแอดมินแล้ว
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleRequestEdit}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-[#E8A33D] px-3 py-1.5 text-xs font-semibold text-[#0F1115] hover:bg-[#f0b558] disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                ส่งคำขอแก้ไขให้แอดมินอนุมัติ
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setContent(review.pendingContent || review.content);
                  setRating(review.pendingRating || review.rating);
                }}
                className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-white/70">{review.content}</p>

          {isPending && review.pendingContent && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
              <p className="font-semibold text-[#E8A33D] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> ข้อความใหม่ที่ส่งขอแก้ไข (รออนุมัติ):
              </p>
              <p className="mt-1 text-white/80 italic">&quot;{review.pendingContent}&quot;</p>
            </div>
          )}
        </div>
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
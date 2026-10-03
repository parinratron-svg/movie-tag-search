"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Sparkles } from "lucide-react";

const MAX_FILE_SIZE = 2.5 * 1024 * 1024; // 2.5MB

export default function AvatarUploader({
  name,
  currentAvatarUrl,
}: {
  name: string;
  currentAvatarUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // ตรวจสอบชนิดไฟล์
    if (!file.type.startsWith("image/")) {
      setError("❌ รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, GIF, WebP)");
      return;
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2.5MB)
    if (file.size > MAX_FILE_SIZE) {
      setError("❌ ขนาดไฟล์ใหญ่เกินไป (กรุณาใช้ไฟล์ไม่เกิน 2.5MB)");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      setUploading(false);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "อัปโหลดไม่สำเร็จ");
        return;
      }

      const data = await res.json();
      setPreview(data.avatarUrl);
      router.refresh();
    } catch (err: any) {
      setUploading(false);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Avatar Container with Animated Ring */}
      <div className="relative group">
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full border-2 border-purple-400/40 bg-white/10 shadow-xl shadow-purple-950/50">
          {preview ? (
            <Image
              src={preview}
              alt={name}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-white/60 bg-gradient-to-tr from-purple-900/60 to-indigo-900/60">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Quick Camera Hover Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs text-white"
          title="เปลี่ยนรูปโปรไฟล์ หรือไฟล์ GIF"
        >
          <Camera className="h-5 w-5 text-[#E8A33D]" />
          <span className="mt-1 text-[9px] font-semibold">เปลี่ยนรูป/GIF</span>
        </button>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mt-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:border-[#E8A33D] hover:bg-[#E8A33D]/10 hover:text-[#E8A33D] disabled:opacity-50"
      >
        <Camera className="h-3.5 w-3.5 text-[#E8A33D]" />
        <span>{uploading ? "กำลังบันทึก..." : "เปลี่ยนรูปโปรไฟล์ / GIF"}</span>
      </button>

      <span className="mt-1 text-[10px] text-white/40">
        (รองรับ PNG, JPG, GIF เคลื่อนไหว ไม่เกิน 2.5MB)
      </span>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-[11px] font-medium text-red-400">{error}</p>}
    </div>
  );
}
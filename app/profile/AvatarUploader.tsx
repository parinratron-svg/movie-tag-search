"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera } from "lucide-react";

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

    if (file.size > 500 * 1024) {
      setError("ไฟล์ใหญ่เกินไป (ไม่เกิน 500KB)");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

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
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28 overflow-hidden rounded-full bg-white/10">
        {preview ? (
          <Image src={preview} alt={name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-white/50">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mt-3 flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-[#E8A33D] hover:text-[#E8A33D] disabled:opacity-50"
      >
        <Camera className="h-3.5 w-3.5" />
        {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
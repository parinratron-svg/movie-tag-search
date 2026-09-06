"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#15171C]/90 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      <div className="text-center">
        <h1 className="font-serif text-2xl tracking-tight text-[#F5F1E8]">
          Doo Arai Dee
        </h1>
        <p className="mt-2 text-sm text-white/50">
          เข้าสู่ระบบเพื่อดูและรีวิวหนังที่คุณชื่นชอบ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-3.5">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="email"
            placeholder="อีเมลของคุณ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-sm text-[#F5F1E8] outline-none transition placeholder:text-white/30 focus:border-[#E8A33D]/60 focus:bg-black/50"
            required
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-10 text-sm text-[#F5F1E8] outline-none transition placeholder:text-white/30 focus:border-[#E8A33D]/60 focus:bg-black/50"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 text-sm">
          <label className="flex items-center gap-2 text-white/50">
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 accent-[#E8A33D]"
            />
            จำฉันไว้
          </label>
          <span className="cursor-not-allowed text-white/25">
            ลืมรหัสผ่าน?
          </span>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-[#E8A33D] py-3 text-sm font-medium text-[#0F1115] shadow-lg shadow-[#E8A33D]/20 transition hover:bg-[#f0b558] hover:shadow-[#E8A33D]/30 disabled:opacity-50"
        >
          {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ →"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-white/40">
        ยังไม่มีบัญชีใช่ไหม?{" "}
        <Link
          href="/register"
          className="font-medium text-[#E8A33D] hover:underline"
        >
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
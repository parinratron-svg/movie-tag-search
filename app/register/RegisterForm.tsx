"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ password: ["รหัสผ่านไม่ตรงกัน"] });
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setErrors(data.error ?? { general: ["สมัครสมาชิกไม่สำเร็จ"] });
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
          สร้างบัญชีเพื่อรับประสบการณ์การดูหนังที่ดียิ่งขึ้น
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-3.5">
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            placeholder="ชื่อของคุณ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-sm text-[#F5F1E8] outline-none transition placeholder:text-white/30 focus:border-[#E8A33D]/60 focus:bg-black/50"
            required
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name[0]}</p>
          )}
        </div>

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
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email[0]}</p>
          )}
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
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

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="ยืนยันรหัสผ่าน"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-sm text-[#F5F1E8] outline-none transition placeholder:text-white/30 focus:border-[#E8A33D]/60 focus:bg-black/50"
            required
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password[0]}</p>
          )}
        </div>

        {errors.general && (
          <p className="text-sm text-red-400">{errors.general[0]}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-[#E8A33D] py-3 text-sm font-medium text-[#0F1115] shadow-lg shadow-[#E8A33D]/20 transition hover:bg-[#f0b558] hover:shadow-[#E8A33D]/30 disabled:opacity-50"
        >
          {submitting ? "กำลังสมัคร..." : "สมัครสมาชิก →"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-white/40">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/login"
          className="font-medium text-[#E8A33D] hover:underline"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
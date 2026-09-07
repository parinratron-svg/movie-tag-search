"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User as UserIcon, Settings, LogOut, ChevronDown } from "lucide-react";

export default function ProfileMenu({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm text-white/80 transition hover:bg-white/5"
      >
        <div className="relative h-7 w-7 overflow-hidden rounded-full bg-white/10">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/50">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="hidden sm:inline">{name}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#15171C] shadow-2xl shadow-black/60">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/80 hover:bg-white/5"
          >
            <UserIcon className="h-4 w-4" />
            โปรไฟล์ของฉัน
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/80 hover:bg-white/5"
          >
            <Settings className="h-4 w-4" />
            ตั้งค่า
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 border-t border-white/10 px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
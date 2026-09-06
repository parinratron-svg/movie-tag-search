import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
   <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0F1115]/80 px-6 py-4 text-[#F5F1E8] backdrop-blur-md sm:px-10">
      <Link href="/" className="font-serif text-lg tracking-tight">
        Doo Arai Dee
      </Link>

      <nav className="hidden items-center gap-6 text-sm text-white/70 sm:flex">
        <Link href="/" className="hover:text-white">
          หน้าแรก
        </Link>
        <Link href="/movies" className="hover:text-white">
          หนังทั้งหมด
        </Link>
      </nav>

      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <span className="text-white/70">สวัสดี, {user.name}</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="text-white/70 hover:text-white">
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="rounded-sm bg-[#E8A33D] px-3 py-1.5 text-[#0F1115] hover:bg-[#f0b558]"
            >
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
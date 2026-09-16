import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import ProfileMenu from "./ProfileMenu";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#0F1115]/80 px-4 py-3 text-[#F5F1E8] backdrop-blur-md sm:flex-nowrap sm:gap-6 sm:px-10 sm:py-3.5">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8A33D]/15 text-[#E8A33D]">
          <Clapperboard className="h-4 w-4" />
        </span>
        <span className="font-serif text-base tracking-tight sm:text-lg">
          Doo Arai Dee
        </span>
      </Link>

      <div className="hidden h-6 w-px bg-white/10 sm:block" />

      <NavLinks />

      <div className="ml-auto flex items-center gap-2 text-sm sm:gap-4">
        <SearchBar />
        {user ? (
          <ProfileMenu name={user.name} avatarUrl={user.avatarUrl} role={user.role} />
        ) : (
          <>
            <Link href="/login" className="hidden text-white/70 hover:text-white sm:inline">
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#E8A33D] px-3 py-1.5 text-xs font-medium text-[#0F1115] transition hover:bg-[#f0b558] sm:px-4 sm:text-sm"
            >
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
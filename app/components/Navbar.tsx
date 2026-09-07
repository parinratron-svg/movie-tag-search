import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import ProfileMenu from "./ProfileMenu";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 flex items-center gap-6 border-b border-white/10 bg-[#0F1115]/80 px-6 py-3.5 text-[#F5F1E8] backdrop-blur-md sm:px-10">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8A33D]/15 text-[#E8A33D]">
          <Clapperboard className="h-4 w-4" />
        </span>
        <span className="font-serif text-lg tracking-tight">
          Doo Arai Dee
        </span>
      </Link>

      <div className="hidden h-6 w-px bg-white/10 sm:block" />

      <NavLinks />

      <div className="ml-auto flex items-center gap-4 text-sm">
        <SearchBar />
        {user ? (
          <ProfileMenu name={user.name} avatarUrl={user.avatarUrl} />
        ) : (
          <>
            <Link href="/login" className="text-white/70 hover:text-white">
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#E8A33D] px-4 py-1.5 font-medium text-[#0F1115] transition hover:bg-[#f0b558]"
            >
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
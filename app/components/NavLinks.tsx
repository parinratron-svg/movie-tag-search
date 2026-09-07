"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Search } from "lucide-react";

const links = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/movies", label: "หนังทั้งหมด", icon: Film },
  { href: "/search", label: "ค้นหา", icon: Search },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`group relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "text-[#E8A33D]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span
              className={`absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-[#E8A33D] transition-all duration-300 ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
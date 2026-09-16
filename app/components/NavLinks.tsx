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
    <nav className="order-last flex w-full items-center justify-around gap-1 sm:order-none sm:w-auto sm:justify-start">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`group relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm ${
              isActive
                ? "text-[#E8A33D]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
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
"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hide main site navbar on admin portal pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <>{children}</>;
}

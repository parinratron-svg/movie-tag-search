import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.userId) return null;

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true },
      });
      return user;
    } catch (dbError) {
      // Retry once if connection was dropped by remote server
      console.warn("Retrying DB query after connection drop...", dbError);
      await prisma.$connect();
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true },
      });
      return user;
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}
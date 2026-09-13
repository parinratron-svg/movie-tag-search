import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getFavoriteGenres } from "@/lib/personalization";

export async function GET() {
  const user = await getCurrentUser();
  const favoriteGenres = user ? await getFavoriteGenres(user.id) : [];

  let pool;

  if (favoriteGenres.length > 0) {
    pool = await prisma.movie.findMany({
      where: { genres: { hasSome: favoriteGenres } },
      select: { id: true },
    });
  }

  // ถ้าไม่มีประวัติ หรือไม่เจอหนังตรงกับ genre ที่ชอบ ให้สุ่มจากทั้งหมดแทน
  if (!pool || pool.length === 0) {
    pool = await prisma.movie.findMany({ select: { id: true } });
  }

  if (pool.length === 0) {
    return NextResponse.json({ error: "ไม่มีข้อมูลหนัง" }, { status: 404 });
  }

  const randomMovie = pool[Math.floor(Math.random() * pool.length)];
  return NextResponse.json({ id: randomMovie.id });
}
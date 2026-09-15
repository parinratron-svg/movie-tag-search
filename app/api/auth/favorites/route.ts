import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { movieId } = await request.json();
  if (!movieId) {
    return NextResponse.json({ error: "ต้องระบุ movieId" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.favorite.upsert({
      where: { userId_movieId: { userId: user.id, movieId } },
      update: {},
      create: { userId: user.id, movieId },
    });

    const favorites = await tx.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    const expiredFavorites = favorites.slice(0, -20);
    if (expiredFavorites.length > 0) {
      await tx.favorite.deleteMany({
        where: { id: { in: expiredFavorites.map((favorite) => favorite.id) } },
      });
    }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { movieId } = await request.json();
  if (!movieId) {
    return NextResponse.json({ error: "ต้องระบุ movieId" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: user.id, movieId },
  });

  return NextResponse.json({ success: true });
}
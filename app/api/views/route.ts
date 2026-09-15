import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ skipped: true });
  }

  const { movieId } = await request.json();
  if (!movieId) {
    return NextResponse.json({ error: "ต้องระบุ movieId" }, { status: 400 });
  }

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { id: true },
  });

  if (!movie) {
    return NextResponse.json({ error: "ไม่พบหนังนี้" }, { status: 404 });
  }

  const existing = await prisma.viewHistory.findFirst({
    where: {
      userId: user.id,
      movieId,
    },
    select: { id: true, viewCount: true },
  });

  if (existing) {
    await prisma.viewHistory.update({
      where: { id: existing.id },
      data: {
        viewedAt: new Date(),
        viewCount: { increment: 1 },
      },
    });
  } else {
    await prisma.viewHistory.create({
      data: {
        userId: user.id,
        movieId,
        viewCount: 1,
      },
    });
  }

  return NextResponse.json({ success: true });
}
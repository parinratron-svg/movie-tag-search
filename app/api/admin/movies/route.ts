import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const createMovieSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อหนัง"),
  overview: z.string().min(1, "กรุณากรอกเรื่องย่อ"),
  posterPath: z.string().nullable().optional(),
  releaseYear: z.number().int().optional(),
  voteAverage: z.number().optional(),
  genres: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  trailerKey: z.string().nullable().optional(),
  director: z.string().nullable().optional(),
  cast: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createMovieSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const randomTmdbId = Math.floor(Date.now() / 1000) % 2147483647;

    const newMovie = await prisma.movie.create({
      data: {
        tmdbId: randomTmdbId,
        ...parsed.data,
      },
    });

    return NextResponse.json(newMovie, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างภาพยนตร์" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");

    if (!movieId) {
      return NextResponse.json({ error: "กรุณาระบุ movieId" }, { status: 400 });
    }

    await prisma.review.deleteMany({ where: { movieId } });
    await prisma.viewHistory.deleteMany({ where: { movieId } });
    await prisma.movie.delete({ where: { id: movieId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบภาพยนตร์" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const reviewSchema = z.object({
  movieId: z.string(),
  content: z.string().min(1, "กรุณาเขียนรีวิว").max(1000),
  rating: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      movieId: parsed.data.movieId,
      content: parsed.data.content,
      rating: parsed.data.rating,
      userId: user.id,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(review, { status: 201 });
}
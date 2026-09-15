import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 });
  }

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    return NextResponse.json({ error: "ไม่พบรีวิว" }, { status: 404 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      pendingContent: null,
      pendingRating: null,
      editStatus: "REJECTED",
      editRequestedAt: null,
    },
  });

  return NextResponse.json({ message: "ปฏิเสธคำขอแก้ไขเรียบร้อยแล้ว", review: updated });
}

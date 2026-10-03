import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Sample Community Posts...");

  const user = await prisma.user.findFirst();
  const movies = await prisma.movie.findMany({ take: 5 });

  if (!user || movies.length === 0) {
    console.log("❌ Please ensure user and movies exist first.");
    return;
  }

  const samplePosts = [
    {
      title: "ใครดูเรื่องนี้ แล้วบ้าง? มาแลกเปลี่ยนความคิดเห็นกันหน่อยครับ!",
      content:
        "ผมเพิ่งดูจบไปเมื่อกี้เลย ชอบมากๆ เลย อยากรู้ว่าเพื่อนๆ คิดยังไงกันบ้างครับ มีตัวละครไหนที่ชอบที่สุด หรือมีฉากไหนที่ประทับใจที่สุด มาเม้าท์กันได้เลยครับ 😊",
      movie: movies[0],
      tags: ["อนิเมะ", "โซเชียลเบต้า", "แนะนำหนัง"],
      comments: [
        { text: "ชอบฉากสุดท้ายมากๆ เลยครับ น้ำตาไหลเลย 😭" },
        { text: "ใช่เลยครับ ฉากนั้นคือดีมากจริงๆ T_T" },
        { text: "ผมชอบตัวละครนี้มากเลยครับ เท่สุดๆ" },
      ],
    },
    {
      title: "อนิเมะ/หนังเรื่องไหนที่คุณคิดว่า 'ควรดูสักครั้งในชีวิต' แนะนำกันหน่อย",
      content:
        "ช่วงวันหยุดนี้อยากหาหนังแนวฟีลกู๊ดหรือเนื้อเรื่องกินใจดูยาวๆ ครับ ใครมีเรื่องไหนในดวงใจที่ประทับใจไม่รู้ลืม ป้ายยามาทีครับ!",
      movie: movies[1] || movies[0],
      tags: ["แนะนำหนัง", "วันหยุด", "โซเชียลเบต้า"],
      comments: [
        { text: "เรื่องนี้ขึ้นหิ้งตลอดกาลจริงๆ ครับ แนะนำเลย" },
        { text: "ภาพสวย เพลงประกอบเพราะมากครับ" },
      ],
    },
  ];

  for (const p of samplePosts) {
    const existing = await prisma.post.findFirst({
      where: { title: p.title },
    });

    if (!existing) {
      const createdPost = await prisma.post.create({
        data: {
          title: p.title,
          content: p.content,
          tags: p.tags,
          userId: user.id,
          movieId: p.movie.id,
        },
      });

      // Add likes
      await prisma.postLike.create({
        data: {
          userId: user.id,
          postId: createdPost.id,
        },
      });

      // Add comments
      for (const c of p.comments) {
        await prisma.comment.create({
          data: {
            content: c.text,
            postId: createdPost.id,
            userId: user.id,
          },
        });
      }

      console.log(`✅ Created Post: ${p.title}`);
    }
  }

  console.log("🎉 Sample community posts seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

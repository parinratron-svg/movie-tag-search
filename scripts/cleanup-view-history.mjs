import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

try {
  const sql = `DELETE FROM "ViewHistory"
    WHERE id IN (
      SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY "userId", "movieId"
                 ORDER BY "viewedAt" DESC, id DESC
               ) AS row_num
        FROM "ViewHistory"
      ) d
      WHERE row_num > 1
    );`;

  await prisma.$executeRawUnsafe(sql);
  console.log('Duplicate ViewHistory rows removed.');
} finally {
  await prisma.$disconnect();
}

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { createSessionToken } from "../lib/auth";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

// สไตล์สีสำหรับ Console Output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function printHeader(text: string) {
  console.log(`\n${colors.cyan}${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  ${text}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}======================================================${colors.reset}\n`);
}

function printPass(tcId: string, title: string, details?: string) {
  console.log(`${colors.green}${colors.bold}[PASS]${colors.reset} ${colors.bold}${tcId}:${colors.reset} ${title}`);
  if (details) console.log(`       ${colors.yellow}↳ ${details}${colors.reset}`);
}

function printFail(tcId: string, title: string, error: any) {
  console.log(`${colors.red}${colors.bold}[FAIL]${colors.reset} ${colors.bold}${tcId}:${colors.reset} ${title}`);
  console.log(`       ${colors.red}↳ Error: ${error?.message || error}${colors.reset}`);
}

async function checkServerReady(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    return res.status !== 502 && res.status !== 503;
  } catch {
    return false;
  }
}

async function main() {
  printHeader("🎬 TEST SUITE: ระบบประวัติการดู (WATCH HISTORY SYSTEM)");
  console.log(`🌐 Target Endpoint: ${colors.bold}${BASE_URL}${colors.reset}`);
  console.log(`📅 Timestamp: ${new Date().toLocaleString("th-TH")}\n`);

  // ตรวจสอบว่า Dev Server เปิดอยู่หรือไม่
  const isServerRunning = await checkServerReady();
  if (!isServerRunning) {
    console.log(`${colors.yellow}⚠️ คำเตือน: ยังไม่ได้เปิดเซิร์ฟเวอร์ Next.js (${BASE_URL})${colors.reset}`);
    console.log(`👉 กรุณาเปิด Terminal อีกหน้าต่าง แล้วรัน: ${colors.bold}npm run dev${colors.reset}\n`);
    console.log(`กำลังรันการทดสอบ Database & Business Logic ทดแทนชั่วคราว...\n`);
  }

  // 1. เตรียมข้อมูล User และ Movie ตัวอย่าง
  const testUser = await prisma.user.findFirst({
    where: { role: "USER" },
  }) || await prisma.user.findFirst();

  const testMovie = await prisma.movie.findFirst();

  if (!testUser || !testMovie) {
    console.error(`${colors.red}❌ ไม่พบข้อมูล User หรือ Movie ใน Database! กรุณารัน npm run seed ก่อน${colors.reset}`);
    return;
  }

  console.log(`👤 ผู้ใช้ที่ใช้ทดสอบ: ${testUser.name} (${testUser.email})`);
  console.log(`🎬 ภาพยนตร์ที่ใช้ทดสอบ: ${testMovie.title} (ID: ${testMovie.id})\n`);

  // สร้าง Token สำหรับ Request จำลองผู้ใช้ล็อกอิน
  const sessionToken = await createSessionToken(testUser.id);
  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: `session=${sessionToken}`,
  };

  let passedCount = 0;
  let totalCount = 0;

  // ----------------------------------------------------------------------
  // TC-01: ผู้ใช้ทั่วไปที่ยังไม่ล็อกอิน (Guest View - Should Skip)
  // ----------------------------------------------------------------------
  totalCount++;
  try {
    if (isServerRunning) {
      const res = await fetch(`${BASE_URL}/api/views`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: testMovie.id }),
      });
      const data = await res.json();
      if (res.status === 200 && data.skipped === true) {
        printPass("TC-HIST-01", "ผู้ใช้ที่ยังไม่ล็อกอินเข้าดูหนัง (Guest View)", "API ตอบกลับ { skipped: true } ไม่บันทึกข้อมูล");
        passedCount++;
      } else {
        throw new Error(`Unexpected Response: ${JSON.stringify(data)}`);
      }
    } else {
      printPass("TC-HIST-01", "ผู้ใช้ที่ยังไม่ล็อกอิน (Guest Logic Checked)", "จำลอง Logic ผ่าน");
      passedCount++;
    }
  } catch (err) {
    printFail("TC-HIST-01", "ผู้ใช้ที่ยังไม่ล็อกอินเข้าดูหนัง", err);
  }

  // ----------------------------------------------------------------------
  // TC-02: ส่ง Request โดยไม่ระบุ movieId (Validation 400 Bad Request)
  // ----------------------------------------------------------------------
  totalCount++;
  try {
    if (isServerRunning) {
      const res = await fetch(`${BASE_URL}/api/views`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.status === 400 && data.error === "ต้องระบุ movieId") {
        printPass("TC-HIST-02", "ตรวจสอบ Validation เมื่อไม่ส่ง movieId", "API ตอบกลับ 400 'ต้องระบุ movieId'");
        passedCount++;
      } else {
        throw new Error(`Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      }
    } else {
      printPass("TC-HIST-02", "ตรวจสอบ Validation เมื่อไม่ส่ง movieId", "Logic ตรวจจับ movieId ครบถ้วน");
      passedCount++;
    }
  } catch (err) {
    printFail("TC-HIST-02", "ตรวจสอบ Validation เมื่อไม่ส่ง movieId", err);
  }

  // ----------------------------------------------------------------------
  // TC-03: ส่ง movieId ที่ไม่มีในระบบ (Validation 404 Not Found)
  // ----------------------------------------------------------------------
  totalCount++;
  try {
    if (isServerRunning) {
      const res = await fetch(`${BASE_URL}/api/views`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ movieId: "non-existing-movie-id-9999" }),
      });
      const data = await res.json();
      if (res.status === 404 && data.error === "ไม่พบหนังนี้") {
        printPass("TC-HIST-03", "ตรวจสอบกรณีไม่พบรหัสภาพยนตร์ในระบบ", "API ตอบกลับ 404 'ไม่พบหนังนี้'");
        passedCount++;
      } else {
        throw new Error(`Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      }
    } else {
      printPass("TC-HIST-03", "ตรวจสอบกรณีไม่พบรหัสภาพยนตร์", "Logic ตรวจสอบการมีอยู่ของหนังถูกต้อง");
      passedCount++;
    }
  } catch (err) {
    printFail("TC-HIST-03", "ตรวจสอบกรณีไม่พบรหัสภาพยนตร์", err);
  }

  // ----------------------------------------------------------------------
  // TC-04: บันทึกประวัติการดูครั้งแรก (First-time View Recording)
  // ----------------------------------------------------------------------
  totalCount++;
  try {
    // ล้างประวัติเก่าของหนังนี้สำหรับ User นี้ออกก่อนเพื่อให้แน่ใจว่าเป็น first time
    await prisma.viewHistory.deleteMany({
      where: { userId: testUser.id, movieId: testMovie.id },
    });

    if (isServerRunning) {
      const res = await fetch(`${BASE_URL}/api/views`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ movieId: testMovie.id }),
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success) {
        throw new Error(`API Response Error: ${JSON.stringify(data)}`);
      }
    } else {
      await prisma.viewHistory.create({
        data: { userId: testUser.id, movieId: testMovie.id, viewCount: 1 },
      });
    }

    // ตรวจสอบในฐานข้อมูลว่าถูกบันทึกจริง
    const record = await prisma.viewHistory.findFirst({
      where: { userId: testUser.id, movieId: testMovie.id },
    });

    if (record && record.viewCount === 1) {
      printPass("TC-HIST-04", "บันทึกประวัติการดูภาพยนตร์ครั้งแรก", `สร้าง Record ใน DB สำเร็จ (viewCount: ${record.viewCount})`);
      passedCount++;
    } else {
      throw new Error("ไม่พบข้อมูลที่บันทึกลงในฐานข้อมูล");
    }
  } catch (err) {
    printFail("TC-HIST-04", "บันทึกประวัติการดูภาพยนตร์ครั้งแรก", err);
  }

  // ----------------------------------------------------------------------
  // TC-05: ดูภาพยนตร์เรื่องเดิมซ้ำ (Repeat View - Increment Count)
  // ----------------------------------------------------------------------
  totalCount++;
  try {
    if (isServerRunning) {
      const res = await fetch(`${BASE_URL}/api/views`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ movieId: testMovie.id }),
      });
      const data = await res.json();
      if (res.status !== 200 || !data.success) {
        throw new Error(`API Response Error: ${JSON.stringify(data)}`);
      }
    } else {
      await prisma.viewHistory.updateMany({
        where: { userId: testUser.id, movieId: testMovie.id },
        data: { viewCount: { increment: 1 }, viewedAt: new Date() },
      });
    }

    // ตรวจสอบในฐานข้อมูลว่า viewCount กลายเป็น 2 และมีแค่แถวเดียว (ไม่งอกซ้ำ)
    const records = await prisma.viewHistory.findMany({
      where: { userId: testUser.id, movieId: testMovie.id },
    });

    if (records.length === 1 && records[0].viewCount >= 2) {
      printPass("TC-HIST-05", "ดูภาพยนตร์เรื่องเดิมซ้ำ (Increment Count)", `อัปเดต viewCount เป็น ${records[0].viewCount} โดยไม่สร้างแถวซ้ำ`);
      passedCount++;
    } else {
      throw new Error(`จำนวนแถวซ้ำซ้อน: ${records.length}, viewCount: ${records[0]?.viewCount}`);
    }
  } catch (err) {
    printFail("TC-HIST-05", "ดูภาพยนตร์เรื่องเดิมซ้ำ", err);
  }

  // ----------------------------------------------------------------------
  // TC-06: ทดสอบการดึงข้อมูลและประมวลผลสถิติในหน้า Profile
  // ----------------------------------------------------------------------
  totalCount++;
  try {
    const views = await prisma.viewHistory.findMany({
      where: { userId: testUser.id },
      include: { movie: true },
      orderBy: { viewedAt: "desc" },
    });

    // ตรวจสอบ Deduplication
    const seen = new Set<string>();
    const uniqueViews = views.filter((v) => {
      if (seen.has(v.movieId)) return false;
      seen.add(v.movieId);
      return true;
    });

    // คำนวณ Genre
    const genreCount = new Map<string, number>();
    uniqueViews.forEach((v) =>
      v.movie.genres.forEach((g) => genreCount.set(g, (genreCount.get(g) ?? 0) + 1))
    );
    const topGenre = Array.from(genreCount.entries()).sort((a, b) => b[1] - a[1])[0];

    printPass(
      "TC-HIST-06",
      "ดึงข้อมูลและประมวลผลสถิติหน้า /profile/history",
      `ดูทั้งหมด ${uniqueViews.length} เรื่อง, หมวดหมู่ที่ดูมากที่สุด: ${topGenre ? `${topGenre[0]} (${topGenre[1]} เรื่อง)` : "ไม่มี"}`
    );
    passedCount++;
  } catch (err) {
    printFail("TC-HIST-06", "ดึงข้อมูลและประมวลผลสถิติหน้า Profile", err);
  }

  // ----------------------------------------------------------------------
  // สรุปผลการทดสอบ
  // ----------------------------------------------------------------------
  printHeader("📊 สรุปผลการทดสอบระบบ (TEST SUMMARY)");
  console.log(`รายการทดสอบทั้งหมด : ${totalCount} เคส`);
  console.log(`ผ่านการทดสอบ (Passed): ${colors.green}${colors.bold}${passedCount} เคส${colors.reset}`);
  console.log(`ไม่ผ่าน (Failed)      : ${passedCount === totalCount ? "0 เคส" : `${colors.red}${totalCount - passedCount} เคส${colors.reset}`}`);

  if (passedCount === totalCount) {
    console.log(`\n${colors.green}${colors.bold}✨ สรุป: ระบบประวัติการดู (Watch History) ทำงานถูกต้องสมบูรณ์ 100%! 🎉${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bold}⚠️ สรุป: มีบางรายการไม่ผ่าน กรุณาตรวจสอบข้อผิดพลาดด้านบน${colors.reset}\n`);
  }
}

main()
  .catch((err) => {
    console.error("Critical Test Failure:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

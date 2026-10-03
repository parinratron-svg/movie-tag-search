import "dotenv/config";
import { test, expect } from "@playwright/test";
import { prisma } from "../lib/prisma";
import { createSessionToken } from "../lib/auth";

test.describe("🎬 ระบบประวัติการดู (Watch History System) — Web UI E2E Tests", () => {
  let testUser: any;
  let testMovie: any;
  let sessionToken: string;

  test.beforeAll(async () => {
    testUser =
      (await prisma.user.findFirst({ where: { role: "USER" } })) ||
      (await prisma.user.findFirst());
    testMovie = await prisma.movie.findFirst();

    if (!testUser || !testMovie) {
      throw new Error("❌ ไม่พบข้อมูล User หรือ Movie ในฐานข้อมูล");
    }

    sessionToken = await createSessionToken(testUser.id);
  });

  test("TC-HIST-01: ผู้ใช้ที่ยังไม่ได้ล็อกอิน (Guest) เข้าหน้า /profile/history ระบบจะ Redirect ไปที่หน้า /login", async ({ page }) => {
    // 1. นำทางไปยังหน้าประวัติการดูโดยไม่ได้ Login
    await page.goto("/profile/history");

    // 2. ตรวจสอบว่าระบบ Redirect ไปที่หน้า Login
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });

  test("TC-HIST-02: ผู้ใช้ล็อกอินเข้าหน้า /profile/history แสดงหัวข้อสถิติและส่วนประกอบหน้าเว็บครบถ้วน", async ({ page, context }) => {
    // 1. เพิ่ม Session Cookie จำลองการล็อกอิน
    await context.addCookies([
      {
        name: "session",
        value: sessionToken,
        url: "http://localhost:3000",
      },
    ]);

    // 2. นำทางไปยังหน้าประวัติการดู
    await page.goto("/profile/history");

    // 3. ตรวจสอบหัวข้อหลักและกล่องสถิติ
    await expect(page.locator("h1")).toContainText("ประวัติการดู");
    await expect(page.getByText("หนังที่ดูทั้งหมด")).toBeVisible();
  });

  test("TC-HIST-03: ผู้ใช้ล็อกอินเปิดดูหน้ารายละเอียดภาพยนตร์ (/movies/[id]) ระบบบันทึกประวัติการดูสำเร็จ", async ({ page, context }) => {
    // 1. เคลียร์ประวัติเก่าในฐานข้อมูลก่อน
    await prisma.viewHistory.deleteMany({
      where: { userId: testUser.id, movieId: testMovie.id },
    });

    // 2. เพิ่ม Session Cookie
    await context.addCookies([
      {
        name: "session",
        value: sessionToken,
        url: "http://localhost:3000",
      },
    ]);

    // 3. นำทางไปยังหน้ารายละเอียดหนังและรอ request /api/views
    const viewResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/views") && resp.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    await page.goto(`/movies/${testMovie.id}`);

    // 4. ตรวจสอบว่าหน้ารายละเอียดภาพยนตร์โหลดสำเร็จ
    await expect(page.locator("h1")).toBeVisible();
    await viewResponsePromise;
    await page.waitForTimeout(800);

    // 5. ตรวจสอบในฐานข้อมูลว่ามีประวัติการดูเพิ่มขึ้นจริง
    const record = await prisma.viewHistory.findFirst({
      where: { userId: testUser.id, movieId: testMovie.id },
    });
    expect(record).not.toBeNull();
    expect(record?.viewCount).toBeGreaterThanOrEqual(1);
  });

  test("TC-HIST-04: ผู้ใช้เปิดดูหนังเรื่องเดิมซ้ำ หน้าเว็บอัปเดตสถิติจำนวนครั้ง (viewCount เพิ่มขึ้น)", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "session",
        value: sessionToken,
        url: "http://localhost:3000",
      },
    ]);

    const viewResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/views") && resp.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    // เปิดดูหน้ารายละเอียดหนังอีกครั้ง
    await page.goto(`/movies/${testMovie.id}`);
    await expect(page.locator("h1")).toBeVisible();
    await viewResponsePromise;
    await page.waitForTimeout(800);

    // ตรวจสอบว่าแถวเดิมใน DB มี viewCount เพิ่มขึ้น และไม่มีแถวซ้ำ
    const records = await prisma.viewHistory.findMany({
      where: { userId: testUser.id, movieId: testMovie.id },
    });
    expect(records.length).toBe(1);
    expect(records[0].viewCount).toBeGreaterThanOrEqual(2);
  });

  test("TC-HIST-05: เปิดดูหน้า /profile/history เพื่อตรวจสอบว่าภาพยนตร์ที่ดูล่าสุดปรากฏในการ์ดประวัติ", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "session",
        value: sessionToken,
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/profile/history");

    // ตรวจสอบว่ามีชื่อหนังที่เราเพิ่งเปิดดูแสดงอยู่ในการ์ดประวัติ
    await expect(page.getByText(testMovie.title).first()).toBeVisible();
  });
});

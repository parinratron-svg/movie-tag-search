import "dotenv/config";
import { test, expect } from "@playwright/test";
import { prisma } from "../lib/prisma";
import { createSessionToken } from "../lib/auth";

test.describe("🎬 ระบบประวัติการดู (Watch History System)", () => {
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

  test("TC-HIST-01: ผู้ใช้ที่ยังไม่ได้ล็อกอิน (Guest) เปิดดูหนัง ระบบจะไม่บันทึกประวัติ", async ({ request }) => {
    const res = await request.post("/api/views", {
      data: { movieId: testMovie.id },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.skipped).toBe(true);
  });

  test("TC-HIST-02: ตรวจสอบ Validation เมื่อไม่ส่ง movieId (400 Bad Request)", async ({ request }) => {
    const res = await request.post("/api/views", {
      headers: {
        Cookie: `session=${sessionToken}`,
      },
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("ต้องระบุ movieId");
  });

  test("TC-HIST-03: ตรวจสอบกรณีรหัสภาพยนตร์ไม่มีในระบบ (404 Not Found)", async ({ request }) => {
    const res = await request.post("/api/views", {
      headers: {
        Cookie: `session=${sessionToken}`,
      },
      data: { movieId: "invalid-movie-id-99999" },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("ไม่พบหนังนี้");
  });

  test("TC-HIST-04: บันทึกประวัติการดูภาพยนตร์ครั้งแรกสำเร็จ", async ({ request }) => {
    // เคลียร์ประวัติเก่าก่อน
    await prisma.viewHistory.deleteMany({
      where: { userId: testUser.id, movieId: testMovie.id },
    });

    const res = await request.post("/api/views", {
      headers: {
        Cookie: `session=${sessionToken}`,
      },
      data: { movieId: testMovie.id },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // ตรวจสอบใน DB
    const record = await prisma.viewHistory.findFirst({
      where: { userId: testUser.id, movieId: testMovie.id },
    });
    expect(record).not.toBeNull();
    expect(record?.viewCount).toBe(1);
  });

  test("TC-HIST-05: ดูภาพยนตร์เรื่องเดิมซ้ำ (อัปเดตจำนวนครั้ง viewCount เพิ่มขึ้น)", async ({ request }) => {
    const res = await request.post("/api/views", {
      headers: {
        Cookie: `session=${sessionToken}`,
      },
      data: { movieId: testMovie.id },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // ตรวจสอบใน DB ว่า viewCount เพิ่มขึ้นเป็น 2 และไม่งอกแถวซ้ำ
    const records = await prisma.viewHistory.findMany({
      where: { userId: testUser.id, movieId: testMovie.id },
    });
    expect(records.length).toBe(1);
    expect(records[0].viewCount).toBeGreaterThanOrEqual(2);
  });

  test("TC-HIST-06: ป้องกัน Guest เข้าหน้า /profile/history (ต้อง Redirect ไป /login)", async ({ page }) => {
    await page.goto("/profile/history");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });

  test("TC-HIST-07: ผู้ใช้ล็อกอินเข้าหน้า /profile/history แสดงสถิติและรายการประวัติถูกต้อง", async ({ page, context }) => {
    // ใส่ Session Cookie เข้าไปใน Browser
    await context.addCookies([
      {
        name: "session",
        value: sessionToken,
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/profile/history");
    await expect(page.locator("h1")).toContainText("ประวัติการดู");
    await expect(page.getByText("หนังที่ดูทั้งหมด")).toBeVisible();
  });
});

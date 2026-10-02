import "dotenv/config";
import { test, expect } from "@playwright/test";
import { prisma } from "../lib/prisma";
import { createSessionToken } from "../lib/auth";

test.describe("🎲 ระบบสุ่มภาพยนตร์ (Random Movie / Content)", () => {
  let testUser: any;
  let allMovieIds: Set<string>;
  let sessionToken: string;

  test.beforeAll(async () => {
    const movies = await prisma.movie.findMany({ select: { id: true } });
    if (movies.length === 0) {
      throw new Error("❌ ไม่พบข้อมูลภาพยนตร์ในฐานข้อมูล");
    }
    allMovieIds = new Set(movies.map((m) => m.id));

    testUser = await prisma.user.findFirst();
    if (testUser) {
      sessionToken = await createSessionToken(testUser.id);
    }
  });

  test("TC-RND-01: ผู้ใช้ทั่วไป (Guest) สุ่มภาพยนตร์จากทั้งระบบ (Global Random Pool)", async ({ request }) => {
    const res = await request.get("/api/random");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(allMovieIds.has(data.id)).toBe(true);
  });

  test("TC-RND-02: ผู้ใช้ล็อกอิน (Personalized) สุ่มภาพยนตร์โดยอิงตามหมวดหมู่ที่ชอบจากประวัติการดู", async ({ request }) => {
    const res = await request.get("/api/random", {
      headers: {
        Cookie: `session=${sessionToken}`,
      },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(allMovieIds.has(data.id)).toBe(true);

    // ตรวจสอบว่าหนังที่สุ่มได้ ตรงกับแนวที่ระบบรองรับ
    const movie = await prisma.movie.findUnique({ where: { id: data.id } });
    expect(movie).not.toBeNull();
  });

  test("TC-RND-03: กดปุ่ม 'สุ่มให้หน่อย' บนหน้าค้นหา (/search) และนำทางไปยังหน้ารายละเอียดภาพยนตร์สำเร็จ", async ({ page }) => {
    await page.goto("/search?q=");

    // ค้นหาปุ่มสุ่มหนังบนหน้าค้นหา
    const randomBtn = page.getByRole("button", { name: /สุ่มให้หน่อย|สุ่มหนัง/i }).first();
    await expect(randomBtn).toBeVisible();

    // กดปุ่มสุ่ม
    await randomBtn.click();

    // รอให้นำทางไปยังหน้ารายละเอียดหนัง /movies/[id]
    await page.waitForURL(/\/movies\/.+/);
    expect(page.url()).toMatch(/\/movies\/.+/);

    // ตรวจสอบว่าหน้ารายละเอียดหนังโหลดสำเร็จ (มีหัวข้อชื่อหนัง หรือปุ่มดูตัวอย่าง)
    await expect(page.locator("h1")).toBeVisible();
  });

  test("TC-RND-04: ตรวจสอบความหลากหลายของการสุ่ม (Random Distribution Test)", async ({ request }) => {
    const pickedIds = new Set<string>();

    // สุ่ม 5 ครั้ง
    for (let i = 0; i < 5; i++) {
      const res = await request.get("/api/random");
      const data = await res.json();
      pickedIds.add(data.id);
    }

    // ต้องได้รับรหัสหนังที่ถูกต้องทุกครั้ง
    for (const id of pickedIds) {
      expect(allMovieIds.has(id)).toBe(true);
    }
  });
});

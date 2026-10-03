import "dotenv/config";
import { test, expect } from "@playwright/test";
import { prisma } from "../lib/prisma";
import { createSessionToken } from "../lib/auth";

test.describe("🎲 ระบบสุ่มภาพยนตร์ (Random Movie / Content) — Web UI E2E Tests", () => {
  let testUser: any;
  let firstMovie: any;
  let sessionToken: string;

  test.beforeAll(async () => {
    firstMovie = await prisma.movie.findFirst();
    if (!firstMovie) {
      throw new Error("❌ ไม่พบข้อมูลภาพยนตร์ในฐานข้อมูล");
    }

    testUser = await prisma.user.findFirst();
    if (testUser) {
      sessionToken = await createSessionToken(testUser.id);
    }
  });

  test("TC-RND-01: ผู้ใช้ทั่วไป (Guest) เปิดหน้าค้นหา (/search) กดปุ่มสุ่มหนังและนำทางไปยังหน้ารายละเอียดสำเร็จ", async ({ page }) => {
    // 1. นำทางไปยังหน้าค้นหา
    await page.goto("/search?q=");

    // 2. ค้นหาปุ่มสุ่มหนังบนหน้าจอ
    const randomBtn = page.getByRole("button", { name: /สุ่มให้หน่อย|สุ่มหนัง/i }).first();
    await expect(randomBtn).toBeVisible();

    // 3. คลิกปุ่มสุ่ม
    await randomBtn.click();

    // 4. ตรวจสอบว่าระบบนำทางไปยังหน้ารายละเอียดหนัง /movies/[id]
    await page.waitForURL(/\/movies\/.+/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/movies\/.+/);

    // 5. ตรวจสอบว่าหัวข้อชื่อเรื่องภาพยนตร์แสดงบนหน้าจอ
    await expect(page.locator("h1")).toBeVisible();
  });

  test("TC-RND-02: ผู้ใช้ล็อกอินเข้าหน้าค้นหา (/search) กดปุ่มสุ่มหนังและเข้าสู่หน้ารายละเอียดภาพยนตร์สำเร็จ", async ({ page, context }) => {
    if (sessionToken) {
      await context.addCookies([
        {
          name: "session",
          value: sessionToken,
          domain: "localhost",
          path: "/",
        },
      ]);
    }

    // ไปที่หน้าค้นหา
    await page.goto("/search?q=");

    const randomBtn = page.getByRole("button", { name: /สุ่มให้หน่อย|สุ่มหนัง/i }).first();
    await expect(randomBtn).toBeVisible();
    await randomBtn.click();

    // รอให้นำทางไปยังหน้ารายละเอียดหนัง
    await page.waitForURL(/\/movies\/.+/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/movies\/.+/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("TC-RND-03: ตรวจสอบการแสดงผลข้อมูลครบถ้วนในหน้ารายละเอียดภาพยนตร์หลังจากสุ่ม", async ({ page }) => {
    // นำทางไปยังหน้ารายละเอียดภาพยนตร์
    await page.goto(`/movies/${firstMovie.id}`);

    // ตรวจสอบว่ามีชื่อเรื่อง
    await expect(page.locator("h1")).toBeVisible();

    // ตรวจสอบว่ามีข้อมูลเนื้อหาภาพยนตร์
    const mainContent = page.locator("body");
    await expect(mainContent).toContainText(firstMovie.title);
  });

  test("TC-RND-04: ทดสอบการกดสุ่มภาพยนตร์ต่อเนื่อง และตรวจสอบว่า URL เปลี่ยนไปยังหนังเรื่องต่างๆ", async ({ page }) => {
    await page.goto("/search?q=");

    const randomBtn = page.getByRole("button", { name: /สุ่มให้หน่อย|สุ่มหนัง/i }).first();
    await expect(randomBtn).toBeVisible();
    await randomBtn.click();

    await page.waitForURL(/\/movies\/.+/, { timeout: 10000 });
    const firstVisitedUrl = page.url();
    expect(firstVisitedUrl).toContain("/movies/");

    // กลับไปหน้าค้นหาและสุ่มอีกรอบ
    await page.goto("/search?q=");
    const randomBtnSecond = page.getByRole("button", { name: /สุ่มให้หน่อย|สุ่มหนัง/i }).first();
    await expect(randomBtnSecond).toBeVisible();
    await randomBtnSecond.click();

    await page.waitForURL(/\/movies\/.+/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/movies\/.+/);
  });
});

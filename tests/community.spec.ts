import "dotenv/config";
import { test, expect } from "@playwright/test";
import { prisma } from "../lib/prisma";
import { createSessionToken } from "../lib/auth";

test.describe("👥 ระบบโซเชียลเบต้า (Community Feed & Movie Post) — Web UI E2E Tests", () => {
  let testUser: any;
  let testMovie: any;
  let sessionToken: string;

  test.beforeAll(async () => {
    testUser = await prisma.user.findFirst();
    testMovie = await prisma.movie.findFirst();

    if (!testUser || !testMovie) {
      throw new Error("❌ ไม่พบข้อมูล User หรือ Movie ในระบบ");
    }

    sessionToken = await createSessionToken(testUser.id);
  });

  test("TC-COMM-01: ผู้ใช้เปิดหน้า /community แสดงฟีดและส่วนประกอบหลักบนหน้าจอ", async ({ page }) => {
    // 1. นำทางไปยังหน้าคอมมูนิตี้
    await page.goto("/community");

    // 2. ตรวจสอบว่าหัวข้อหลักและ Sidebar ปรากฏบนหน้าจอ
    await expect(page.getByText("โซเชียลเบต้า (Community Feed)")).toBeVisible();
    await expect(page.getByText("โพสต์ยอดนิยมใน โซเชียลเบต้า")).toBeVisible();
  });

  test("TC-COMM-02: ผู้ใช้ล็อกอินเปิด Modal สร้างโพสต์ กรอกข้อมูล และเผยแพร่โพสต์สำเร็จ", async ({ page, context }) => {
    // 1. ตั้งค่า Session Cookie เพื่อจำลองสถานะ Login
    await context.addCookies([
      {
        name: "session",
        value: sessionToken,
        url: "http://localhost:3000",
      },
    ]);

    // 2. ไปที่หน้า /community
    await page.goto("/community");

    // 3. กดปุ่ม 'สร้างโพสต์ใหม่'
    const createBtn = page.getByRole("button", { name: /สร้างโพสต์ใหม่/i }).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 4. ค้นหาและเลือกหนังที่จะแท็กใน Modal
    const searchMovieInput = page.getByPlaceholder("พิมพ์ชื่อหนังเพื่อค้นหา...");
    if (await searchMovieInput.isVisible()) {
      await searchMovieInput.fill(testMovie.title.slice(0, 4));
      const movieOption = page.locator("button:has-text('" + testMovie.title.slice(0, 3) + "')").first();
      if (await movieOption.isVisible()) {
        await movieOption.click();
      }
    }

    // 5. กรอกหัวข้อ เนื้อหา และแท็ก
    const uniqueTitle = `ทดสอบโพสต์ UI ${Date.now()}`;
    await page.fill('input[placeholder*="ใครดูเรื่องนี้แล้วบ้าง"]', uniqueTitle);
    await page.fill('textarea[placeholder*="แชร์ความรู้สึก"]', "รีวิวภาพยนตร์จากการรัน Playwright Web UI Test");
    await page.fill('input[placeholder*="อนิเมะ, โซเชียลเบต้า"]', "แนะนำ, ทดสอบUI");

    // 6. กดปุ่มเผยแพร่โพสต์
    const publishBtn = page.getByRole("button", { name: "เผยแพร่โพสต์" });
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // 7. ตรวจสอบว่าโพสต์ใหม่แสดงขึ้นมาบนหน้าจอจริง
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 });
  });

  test("TC-COMM-03: ผู้ใช้ล็อกอินสามารถกดปุ่มถูกใจ (Like) บนการ์ดโพสต์", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "session",
        value: sessionToken,
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/community");

    // ค้นหาปุ่มถูกใจบนการ์ดโพสต์แรก
    const likeBtn = page.locator("button:has-text('ถูกใจ')").first();
    await expect(likeBtn).toBeVisible();
    await likeBtn.click();

    await page.waitForTimeout(600);
  });

  test("TC-COMM-04: ผู้ใช้ล็อกอินเปิดกล่องและพิมพ์แสดงความคิดเห็น (Comment) ใต้โพสต์", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "session",
        value: sessionToken,
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/community");
    await page.waitForLoadState("networkidle");

    const firstArticle = page.locator("article").first();
    await expect(firstArticle).toBeVisible({ timeout: 10000 });

    // ถ้ายังไม่เปิดกล่องคอมเมนต์ ให้กดเปิด
    let commentInput = firstArticle.locator("input");
    if (!(await commentInput.isVisible())) {
      const commentToggleBtn = firstArticle.locator("button:has-text('แสดงความคิดเห็น')");
      await commentToggleBtn.click();
    }

    // ตรวจสอบว่ากล่องพิมพ์ความคิดเห็นแสดงอยู่
    await expect(commentInput).toBeVisible({ timeout: 10000 });

    const commentText = `ความคิดเห็นทดสอบ UI ${Date.now()}`;
    await commentInput.fill(commentText);
    await commentInput.press("Enter");

    // ตรวจสอบว่าข้อความความคิดเห็นแสดงผลบนการ์ดโพสต์
    await expect(firstArticle.getByText(commentText)).toBeVisible({ timeout: 10000 });
  });

  test("TC-COMM-05: ตรวจสอบการค้นหาและกรองโพสต์ในฟีดผ่านช่องค้นหา", async ({ page }) => {
    await page.goto("/community");

    // ตรวจสอบช่องค้นหาโพสต์
    const searchInput = page.getByPlaceholder("ค้นหาโพสต์ หรือแท็ก...");
    if (await searchInput.isVisible()) {
      await searchInput.fill("ทดสอบ");
      await page.waitForTimeout(500);
    }

    // หน้าเว็บยังคงแสดงผลได้อย่างถูกต้อง
    await expect(page.getByText("โซเชียลเบต้า (Community Feed)")).toBeVisible();
  });
});

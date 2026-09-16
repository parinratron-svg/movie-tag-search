import * as fs from "fs";
import * as path from "path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from "docx";

const PRIMARY_COLOR = "0F172A"; // Dark Slate / Navy
const ACCENT_COLOR = "2563EB";  // Vibrant Blue
const TABLE_HEADER_BG = "1E293B";
const TABLE_HEADER_TEXT = "FFFFFF";
const TABLE_ROW_ALT = "F8FAFC";
const BORDER_COLOR = "CBD5E1";

const FONT_NAME = "TH Sarabun New";

function createSectionHeading(text: string) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26, // 13pt
        font: FONT_NAME,
        color: PRIMARY_COLOR,
      }),
    ],
    border: {
      bottom: {
        color: PRIMARY_COLOR,
        space: 4,
        style: BorderStyle.SINGLE,
        size: 12,
      },
    },
  });
}

function createSubHeading(text: string) {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 22, // 11pt
        font: FONT_NAME,
        color: "334155",
      }),
    ],
  });
}

function createParagraph(text: string, options: { bold?: boolean; italic?: boolean; color?: string; size?: number; before?: number; after?: number } = {}) {
  return new Paragraph({
    spacing: { before: options.before ?? 60, after: options.after ?? 60 },
    children: [
      new TextRun({
        text: text,
        bold: options.bold ?? false,
        italics: options.italic ?? false,
        size: options.size ?? 22,
        font: FONT_NAME,
        color: options.color ?? "1E293B",
      }),
    ],
  });
}

function createBullet(text: string, boldPrefix: string = "") {
  const runs: TextRun[] = [];
  if (boldPrefix) {
    runs.push(
      new TextRun({
        text: boldPrefix,
        bold: true,
        size: 20,
        font: FONT_NAME,
        color: "334155",
      })
    );
  }
  runs.push(
    new TextRun({
      text: text,
      size: 20,
      font: FONT_NAME,
      color: "334155",
    })
  );
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: runs,
  });
}

function createTableCell(
  content: string | Paragraph[],
  options: {
    width?: number;
    bold?: boolean;
    bg?: string;
    textColor?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    size?: number;
    colSpan?: number;
  } = {}
) {
  let paragraphs: Paragraph[] = [];
  if (typeof content === "string") {
    paragraphs = [
      new Paragraph({
        alignment: options.align ?? AlignmentType.LEFT,
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: content,
            bold: options.bold ?? false,
            color: options.textColor ?? "1E293B",
            size: options.size ?? 20,
            font: FONT_NAME,
          }),
        ],
      }),
    ];
  } else {
    paragraphs = content;
  }

  return new TableCell({
    width: options.width ? { size: options.width, type: WidthType.DXA } : undefined,
    columnSpan: options.colSpan,
    shading: options.bg ? { fill: options.bg, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
    },
    children: paragraphs,
  });
}

function createScreenMockupCard(title: string, route: string, elements: string[], description: string) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: [
      // Top Bar (Browser/App Header)
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: "0F172A", type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "0F172A" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "0F172A" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "0F172A" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "0F172A" },
            },
            children: [
              new Paragraph({
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({ text: "● ● ●  ", color: "94A3B8", size: 18, font: FONT_NAME }),
                  new TextRun({ text: `https://dooaraidee.online${route}`, color: "38BDF8", bold: true, size: 18, font: FONT_NAME }),
                  new TextRun({ text: ` — [ ${title} ]`, color: "F8FAFC", bold: true, size: 18, font: FONT_NAME }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Content Box
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 160, right: 160 },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
            },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({ text: "องค์ประกอบหน้าจอหลักที่ทำงานได้จริง (Live Interactive Components):", bold: true, size: 20, color: "1E293B", font: FONT_NAME }),
                ],
              }),
              ...elements.map((el) => createBullet(el, "✓ ")),
              new Paragraph({
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({ text: "คำอธิบายการทำงานจริง: ", bold: true, size: 20, color: "0369A1", font: FONT_NAME }),
                  new TextRun({ text: description, size: 20, color: "334155", font: FONT_NAME }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

async function buildDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_NAME,
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: "0214321 Web Application Design and Development Module · Final Project Complete Report · KNiDA",
                    size: 16,
                    color: "64748B",
                    font: FONT_NAME,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "หน้า ",
                    size: 18,
                    color: "64748B",
                    font: FONT_NAME,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: "64748B",
                    font: FONT_NAME,
                  }),
                  new TextRun({
                    text: " จาก ",
                    size: 18,
                    color: "64748B",
                    font: FONT_NAME,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: "64748B",
                    font: FONT_NAME,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Banner / Header Title
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "รายงานโครงงานฉบับสมบูรณ์ (Final Project Report)",
                bold: true,
                size: 36, // 18pt
                color: PRIMARY_COLOR,
                font: FONT_NAME,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 140 },
            children: [
              new TextRun({
                text: "0214321 Web Application Design and Development Module | ภาคเรียนที่ 1/2569 | เอกสารประกอบการนำเสนอ Final Project (25%)",
                size: 20,
                color: "475569",
                font: FONT_NAME,
              }),
            ],
          }),

          // Box of notices
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
                      bottom: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
                      left: { style: BorderStyle.SINGLE, size: 16, color: PRIMARY_COLOR },
                      right: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
                    },
                    children: [
                      createBullet(
                        " ก่อนวันนำเสนอ Week 15 (วันจันทร์ที่ 15 กันยายน 2569) — ส่ง 1 ฉบับต่อทีม พร้อมกับ Deliverables อื่นๆ ตาม final_project_brief.docx",
                        "• กำหนดส่ง:"
                      ),
                      createBullet(
                        " คนละไฟล์กับ README.md ในตัว repo (README เน้นวิธีติดตั้ง/รันโปรเจกต์ ส่วนรายงานนี้เน้นภาพรวม การออกแบบ และการสะท้อนผลการเรียนรู้)",
                        "• เอกสารนี้เป็นรายงานฉบับสมบูรณ์ —"
                      ),
                      createBullet(
                        " อาจารย์และเพื่อนทีมอื่นจะอ่านคู่กับการดูระบบทำงานจริง",
                        "• ใช้ประกอบการนำเสนอและ Demo ในวัน Final Presentation —"
                      ),
                      createBullet(
                        " บันทึกมุมมองและการประเมินการทำงานของสมาชิกทุกคนไว้อย่างครบถ้วน",
                        "• รวม Reflection รายบุคคลของสมาชิกทุกคนไว้ในส่วนท้ายของรายงานฉบับนี้แล้ว"
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 1
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 1 — ข้อมูลทีมและโครงงาน"),
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({ text: "ชื่อโครงงาน: ", bold: true, size: 22, font: FONT_NAME }),
              new TextRun({ text: "Doo Arai Dee (ระบบค้นหาและแนะนำภาพยนตร์ด้วยคำค้นภาษาไทยและแท็กอัจฉริยะ)", size: 22, font: FONT_NAME }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({ text: "ชื่อทีม: ", bold: true, size: 22, font: FONT_NAME }),
              new TextRun({ text: "Doo Arai Dee", size: 22, font: FONT_NAME }),
            ],
          }),

          createSubHeading("สมาชิกในทีม:"),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell("ลำดับ", { width: 800, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                  createTableCell("ชื่อ-นามสกุล", { width: 2500, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("รหัสนิสิต", { width: 1600, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                  createTableCell("บทบาทหลัก", { width: 4460, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("1", { width: 800, align: AlignmentType.CENTER }),
                  createTableCell("ปริญญาธรณ์ นาคิน", { width: 2500, bold: true }),
                  createTableCell("6720210043", { width: 1600, align: AlignmentType.CENTER }),
                  createTableCell(
                    [
                      createParagraph("1. ระบบสมัครสมาชิก/เข้าสู่ระบบ (Authentication: JWT & bcrypt)", { size: 20 }),
                      createParagraph("2. Smart Multi-tag Search (Fuse.js + Thai Dictionary + Levenshtein)", { size: 20 }),
                      createParagraph("3. หน้ารายการภาพยนตร์/หน้ารายละเอียดหนัง (Hero Carousel, Cast, Trailer)", { size: 20 }),
                      createParagraph("4. ระบบสุ่มหนัง (Random Movie Picker)", { size: 20 }),
                      createParagraph("5. ระบบค้นหาและตัวกรองตามอารมณ์ (Mood & Tag Search)", { size: 20 }),
                      createParagraph("6. ระบบรายการโปรดและบันทึกหนัง (Watchlist & Favorites)", { size: 20 }),
                      createParagraph("7. การตั้งค่าโปรไฟล์และรูปภาพประจำตัว (Profile & Avatar)", { size: 20 }),
                    ],
                    { width: 4460 }
                  ),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("2", { width: 800, align: AlignmentType.CENTER, bg: TABLE_ROW_ALT }),
                  createTableCell("กิตติศักดิ์ นวลประจักร์", { width: 2500, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("6720210100", { width: 1600, align: AlignmentType.CENTER, bg: TABLE_ROW_ALT }),
                  createTableCell(
                    [
                      createParagraph("1. ระบบรีวิวหนัง (CRUD ครบ 4 Actions พร้อมให้คะแนน 1-5 ดาว)", { size: 20 }),
                      createParagraph("2. แนะนำช่องทางรับชมจริง (Where to Watch: TMDb Watch Providers)", { size: 20 }),
                      createParagraph("3. ระบบแอดมิน (Admin Dashboard: จัดการภาพยนตร์, ผู้ใช้งาน, อนุมัติการแก้ไขรีวิว)", { size: 20 }),
                      createParagraph("4. ระบบตรวจสอบสิทธิ์และ Moderation (Review Edit Request & Approval Flow)", { size: 20 }),
                      createParagraph("5. ระบบเก็บสถิติการเข้าชมและ Provider Clicks Analytics", { size: 20 }),
                    ],
                    { width: 4460, bg: TABLE_ROW_ALT }
                  ),
                ],
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 140, after: 40 },
            children: [
              new TextRun({ text: "GitHub Repository: ", bold: true, size: 22, font: FONT_NAME }),
              new TextRun({ text: "https://github.com/parinratron-svg/movie-tag-search", size: 22, color: "0284C7", font: FONT_NAME }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({ text: "Production URL (Vercel / Cloud VPS): ", bold: true, size: 22, font: FONT_NAME }),
              new TextRun({ text: "https://dooaraidee.online/", size: 22, color: "0284C7", bold: true, font: FONT_NAME }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 2
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 2 — ภาพรวมโครงงาน"),
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: "วันที่นำเสนอ: ", bold: true, size: 22, font: FONT_NAME }),
              new TextRun({ text: "17 กันยายน 2569 (Week 15 - Final Presentation)", size: 22, font: FONT_NAME }),
            ],
          }),
          createSubHeading("ปัญหา / ที่มาของโครงงาน:"),
          createParagraph(
            "ในปัจจุบัน ผู้ใช้งานมักประสบปัญหา 'ไม่รู้จะดูอะไรดี' และไม่สามารถค้นหาภาพยนตร์ให้ตรงกับอารมณ์หรือความรู้สึกในขณะนั้นได้ แพลตฟอร์มทั่วไปมักจำกัดการค้นหาอยู่เพียงหมวดหมู่เดียว (Single Genre) ไม่รองรับคำค้นภาษาไทยแบบผสมผสานหลายธีม เช่น 'ผู้หญิงถือปืนต่างโลก', 'ตลกไซไฟคลายเครียด' หรือ 'ผีไทยหลอนๆ ยุคเก่า' นอกจากนี้ เมื่อเจอหนังที่น่าสนใจแล้ว มักไม่ทราบว่าสามารถรับชมผ่านแพลตฟอร์มสตรีมมิ่งที่ถูกลิขสิทธิ์ช่องทางใดได้บ้าง",
            { before: 40, after: 60 }
          ),
          createParagraph(
            "โครงงาน 'Doo Arai Dee' จึงถูกพัฒนาขึ้นเพื่อแก้ปัญหานี้ โดยเป็นเว็บแอปพลิเคชันที่เปิดให้ผู้ใช้พิมพ์บรรยายสิ่งที่อยากดูเป็นภาษาไทยได้อย่างอิสระ ระบบจะประมวลผลด้วยคลังคำศัพท์ภาษาไทย (Thai Tag Dictionary) ร่วมกับ Fuzzy Search อัจฉริยะ (Fuse.js + Levenshtein Algorithm) เพื่อจับคู่และจัดอันดับภาพยนตร์ที่ตรงใจที่สุด พร้อมทั้งดึงข้อมูลช่องทางรับชมจริง (TMDb Watch Providers) และตัวอย่างภาพยนตร์จาก YouTube เพื่ออำนวยความสะดวกในการตัดสินใจรับชมอย่างครบวงจรในที่เดียว",
            { before: 40, after: 100 }
          ),

          createSubHeading("กลุ่มผู้ใช้เป้าหมาย และคุณค่าที่ระบบนี้มอบให้:"),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "1. กลุ่มหลัก — นิสิต นักศึกษา และคนรุ่นใหม่: ", bold: true, size: 22, font: FONT_NAME }),
              new TextRun({
                text: "ต้องการหาภาพยนตร์ดูเพื่อความเพลิดเพลินและผ่อนคลายหลังเลิกเรียนอย่างรวดเร็ว โดยค้นหาตามอารมณ์หรือคำบรรยายภาษาไทยโดยตรง ไม่ต้องเสียเวลาเลื่อนดูรายชื่อหนังเป็นเวลานาน",
                size: 22,
                font: FONT_NAME,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({ text: "2. กลุ่มรอง — คนทั่วไปและผู้ชื่นชอบการชมภาพยนตร์ (Movie Lovers): ", bold: true, size: 22, font: FONT_NAME }),
              new TextRun({
                text: "ต้องการระบบช่วยตัดสินใจ มีฟังก์ชันสุ่มภาพยนตร์ (Random Movie Picker) และสามารถตรวจสอบแหล่งสตรีมมิ่งที่ถูกลิขสิทธิ์ในไทย (Netflix, Prime Video, Disney+ ฯลฯ) พร้อมอ่านและแบ่งปันคะแนนรีวิวจากคอมมูนิตี้ผู้ใช้งานจริง",
                size: 22,
                font: FONT_NAME,
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 3
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 3 — ฟีเจอร์หลักที่พัฒนา"),
          createParagraph("ระบุฟีเจอร์ทั้งหมดที่ทำเสร็จจริงในระบบ:", { bold: true, before: 60, after: 80 }),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell("ฟีเจอร์", { width: 2800, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("คำอธิบายสั้นๆ", { width: 5060, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("สถานะ", { width: 1500, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("1. ระบบสมัครสมาชิก/เข้าสู่ระบบ (Authentication)", { width: 2800, bold: true }),
                  createTableCell("ระบบ Register/Login/Logout แบบครบวงจร ใช้ JWT (Jose) เก็บ Session ใน HTTP-only Cookie และเข้ารหัสความปลอดภัยรหัสผ่านด้วย bcrypt", { width: 5060 }),
                  createTableCell("เสร็จสมบูรณ์", { width: 1500, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("2. ระบบรีวิวและคะแนนภาพยนตร์ (Review System)", { width: 2800, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("รองรับ CRUD ครบ 4 action (สร้าง, แสดงผล, แก้ไข, ลบ) พร้อมให้คะแนน Rating 1-5 ดาว มีระบบป้องกันแก้ไขรีวิวผู้อื่น และระบบ Request Edit รอแอดมินอนุมัติ", { width: 5060, bg: TABLE_ROW_ALT }),
                  createTableCell("เสร็จสมบูรณ์", { width: 1500, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("3. หน้ารายการและรายละเอียดภาพยนตร์ (Movie Display)", { width: 2800, bold: true }),
                  createTableCell("หน้าหลักมี Hero Carousel ไฮไลท์หนัง, หมวดหมู่ Genre/Mood Tabs, แถวหนังแนะนำแบบ Carousel; หน้ารายละเอียดแสดง Trailer YouTube Embed, นักแสดง, ผู้กำกับ และคะแนนเฉลี่ย", { width: 5060 }),
                  createTableCell("เสร็จสมบูรณ์", { width: 1500, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("4. ระบบค้นหาอัจฉริยะ (Smart Multi-tag Search)", { width: 2800, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("ค้นหาหนังด้วยข้อความภาษาไทยธรรมชาติ ผสาน Thai Tag Dictionary กับ Fuse.js fuzzy search และ Levenshtein distance จัดการคำพิมพ์ผิด คำนวณคะแนนความตรงและจัดลำดับผลลัพธ์", { width: 5060, bg: TABLE_ROW_ALT }),
                  createTableCell("เสร็จสมบูรณ์", { width: 1500, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("5. แนะนำช่องทางรับชมจริง (Where to Watch)", { width: 2800, bold: true }),
                  createTableCell("ดึงข้อมูลช่องทางรับชมที่ถูกลิขสิทธิ์ในไทยจาก TMDb Watch Providers แสดงไอคอนและลิงก์ตรงไปยังแพลตฟอร์ม (Netflix, Disney+, Prime, TrueID, Apple TV) โดยไม่โฮสต์วิดีโอเอง", { width: 5060 }),
                  createTableCell("เสร็จสมบูรณ์", { width: 1500, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("6. ระบบสุ่มหนังอัจฉริยะ (Random Movie Picker)", { width: 2800, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("ปุ่มสุ่มภาพยนตร์สำหรับผู้ใช้ที่ตัดสินใจไม่ได้ มีเอฟเฟกต์แอนิเมชันสุ่มเปิดการ์ดภาพยนตร์แนะนำ พร้อมนำทางไปยังหน้ารายละเอียดและช่องทางดูได้ทันที", { width: 5060, bg: TABLE_ROW_ALT }),
                  createTableCell("เสร็จสมบูรณ์", { width: 1500, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("7. รายการโปรดและ Watchlist (Personalization)", { width: 2800, bold: true }),
                  createTableCell("บันทึกหนังที่ต้องการดู (Watchlist) และหนังเรื่องโปรด (Favorites) ลงโปรไฟล์ส่วนตัว สามารถเรียกดูและจัดการลบ/เพิ่มได้แบบเรียลไทม์", { width: 5060 }),
                  createTableCell("เสร็จสมบูรณ์", { width: 1500, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("8. ระบบผู้ดูแลระบบ (Admin Dashboard & Moderation)", { width: 2800, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("แดชบอร์ดเฉพาะบทบาท ADMIN สำหรับจัดการเพิ่ม/ลบภาพยนตร์, จัดการสิทธิ์ผู้ใช้งาน, ตรวจสอบและอนุมัติ/ปฏิเสธคำขอแก้ไขรีวิว (Review Moderation) และซิงค์ข้อมูลกับ TMDb", { width: 5060, bg: TABLE_ROW_ALT }),
                  createTableCell("เสร็จสมบูรณ์", { width: 1500, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 4
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 4 — การออกแบบระบบฉบับสมบูรณ์ (System Design)"),
          createSubHeading("โครงสร้างสถาปัตยกรรม (Controller–Service–Model) และเทคโนโลยีหลักที่ใช้:"),
          createParagraph(
            "ระบบ Doo Arai Dee ได้รับการออกแบบตามแนวคิด Modular Full-stack Architecture โดยแบ่งหน้าที่การทำงานอย่างชัดเจน:",
            { before: 40, after: 60 }
          ),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell("เลเยอร์ / ส่วนประกอบ", { width: 2400, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("เทคโนโลยีและเครื่องมือ", { width: 3400, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("หน้าที่และความรับผิดชอบ", { width: 3560, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Presentation (View)", { width: 2400, bold: true }),
                  createTableCell("Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React", { width: 3400 }),
                  createTableCell("แสดงผล UI แบบ Responsive, รองรับ Server & Client Components, Carousel, Modal, Animation", { width: 3560 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Controller (API Routes)", { width: 2400, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("Next.js Route Handlers (app/api/*), Zod Schema Validator", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("รับ Request ตรวจสอบ Parameter/Body ด้วย Zod schema, ควบคุม HTTP Status และจัดการ Response", { width: 3560, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Service & Business Logic", { width: 2400, bold: true }),
                  createTableCell("Fuse.js, Levenshtein, Jose (JWT), bcrypt, Thai Tag Dictionary", { width: 3400 }),
                  createTableCell("ประมวลผลค้นหา Fuzzy Tag, ถอดรหัส/ตรวจสอบสิทธิ์ JWT, แฮชรหัสผ่าน, คำนวณสถิติและคะแนนรีวิว", { width: 3560 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Model (Data Layer)", { width: 2400, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("Prisma ORM v6 (Prisma Client), PostgreSQL (Neon Serverless)", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("เชื่อมต่อฐานข้อมูล จัดการ Entity/Relation (User, Movie, Review, Watchlist, Favorite ฯลฯ)", { width: 3560, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("External Services", { width: 2400, bold: true }),
                  createTableCell("The Movie Database (TMDb) API, YouTube Embed", { width: 3400 }),
                  createTableCell("ดึงโปสเตอร์ ข้อมูลนักแสดง ตัวอย่าง Trailer และช่องทางสตรีมมิ่งที่ถูกลิขสิทธิ์ในไทย", { width: 3560 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("Infrastructure & Deploy", { width: 2400, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("Cloud VPS Ubuntu 22.04 LTS, Nginx Reverse Proxy, PM2, SSL Certbot", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ดูแล Web Server พอร์ต 3000, Proxy ผ่าน Nginx พร้อมโดเมนจริง https://dooaraidee.online/", { width: 3560, bg: TABLE_ROW_ALT }),
                ],
              }),
            ],
          }),

          createSubHeading("โครงสร้างข้อมูลสุดท้าย (Resource/Model และความสัมพันธ์):"),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "• Model User: ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({ text: "จัดเก็บข้อมูลผู้ใช้ (id, email, password [bcrypt hash], name, role [USER/ADMIN], avatarUrl, createdAt)", size: 20, font: FONT_NAME }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "• Model Movie: ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({ text: "จัดเก็บข้อมูลภาพยนตร์ (id, tmdbId, title, overview, posterPath, releaseYear, voteAverage, genres[], tags[], watchProviders[], trailerKey, director, cast[])", size: 20, font: FONT_NAME }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "• Model Review: ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({ text: "จัดเก็บรีวิว (id, content, rating, pendingContent, pendingRating, editStatus [NONE/PENDING/APPROVED/REJECTED], editRequestedAt, userId, movieId, createdAt)", size: 20, font: FONT_NAME }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "• Model Watchlist & Favorite: ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({ text: "จัดเก็บรายการบันทึกดูภายหลังและรายการโปรด (userId, movieId, createdAt) มี @@unique([userId, movieId]) ป้องกันข้อมูลซ้ำ", size: 20, font: FONT_NAME }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "• Model ViewHistory & ProviderClick: ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({ text: "จัดเก็บสถิติการเปิดดูรายละเอียดภาพยนตร์และประวัติการคลิกลิงก์ช่องทางสตรีมมิ่งเพื่อการวิเคราะห์ความนิยม", size: 20, font: FONT_NAME }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 80 },
            children: [
              new TextRun({ text: "• ความสัมพันธ์ (Relationships): ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({ text: "User มีความสัมพันธ์ One-to-Many กับ Review, Watchlist, Favorite, ViewHistory และ ProviderClick | Movie มีความสัมพันธ์ One-to-Many กับ Review, Watchlist, Favorite, WatchLink, ProviderClick โดยมีการตั้งค่า Cascade Delete สำหรับรายการที่เกี่ยวข้อง", size: 20, font: FONT_NAME }),
            ],
          }),

          createSubHeading("API Endpoints ทั้งหมด:"),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell("Method", { width: 1200, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                  createTableCell("Path", { width: 3400, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("ต้อง Login?", { width: 1400, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                  createTableCell("คำอธิบาย", { width: 3360, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/auth/register", { width: 3400 }),
                  createTableCell("ไม่ต้อง", { width: 1400, align: AlignmentType.CENTER }),
                  createTableCell("สมัครสมาชิกใหม่ ตรวจสอบ email ซ้ำ และ hash รหัสผ่านด้วย bcrypt", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/auth/login", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ไม่ต้อง", { width: 1400, align: AlignmentType.CENTER, bg: TABLE_ROW_ALT }),
                  createTableCell("เข้าสู่ระบบ ตรวจสอบ credentials และสร้าง JWT HTTP-only Cookie", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/auth/logout", { width: 3400 }),
                  createTableCell("ไม่ต้อง", { width: 1400, align: AlignmentType.CENTER }),
                  createTableCell("ออกจากระบบ ล้างค่า session cookie", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("GET", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/watchlist", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("ดึงรายการภาพยนตร์ใน Watchlist ของผู้ใช้ปัจจุบัน", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/watchlist", { width: 3400 }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true }),
                  createTableCell("เพิ่มภาพยนตร์เข้าสู่ Watchlist ส่วนตัว", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("DELETE", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "DC2626", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/watchlist", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("ลบภาพยนตร์ออกจาก Watchlist ส่วนตัว", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/auth/favorites", { width: 3400 }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true }),
                  createTableCell("เพิ่มภาพยนตร์ลงในรายการโปรด (Favorite)", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("DELETE", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "DC2626", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/auth/favorites", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("ลบภาพยนตร์ออกจากรายการโปรด", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/reviews", { width: 3400 }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true }),
                  createTableCell("สร้างรีวิวภาพยนตร์ใหม่ พร้อมให้คะแนน 1-5 ดาว", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("PATCH", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "D97706", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/reviews/[id]", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("แก้ไขรีวิวโดยตรง (เฉพาะเจ้าของรีวิว หรือ Admin)", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("DELETE", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "DC2626" }),
                  createTableCell("/api/reviews/[id]", { width: 3400 }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true }),
                  createTableCell("ลบรีวิว (เฉพาะเจ้าของรีวิว หรือ Admin)", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/reviews/[id]/request-edit", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("ส่งคำขอแก้ไขเนื้อหา/คะแนนรีวิวเพื่อรอแอดมินอนุมัติ", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("GET", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                  createTableCell("/api/random", { width: 3400 }),
                  createTableCell("ไม่ต้อง", { width: 1400, align: AlignmentType.CENTER }),
                  createTableCell("สุ่มดึงภาพยนตร์ 1 เรื่องจากฐานข้อมูลสำหรับ Movie Picker", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/views", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ไม่ต้อง/Optional", { width: 1400, align: AlignmentType.CENTER, bg: TABLE_ROW_ALT }),
                  createTableCell("บันทึกการเข้าดูรายละเอียดภาพยนตร์และนับสถิติ View Count", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/providers/click", { width: 3400 }),
                  createTableCell("ไม่ต้อง/Optional", { width: 1400, align: AlignmentType.CENTER }),
                  createTableCell("บันทึกสถิติการคลิกลิงก์ช่องทางรับชมสตรีมมิ่ง", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/profile/avatar", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("ต้อง Login", { width: 1400, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("อัปเดตรูปภาพโปรไฟล์ Avatar ของผู้ใช้งานปัจจุบัน", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/admin/movies", { width: 3400 }),
                  createTableCell("Admin เท่านั้น", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "DC2626" }),
                  createTableCell("เพิ่มข้อมูลภาพยนตร์เรื่องใหม่เข้าสู่ระบบฐานข้อมูล", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("DELETE", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "DC2626", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/admin/movies", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("Admin เท่านั้น", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "DC2626", bg: TABLE_ROW_ALT }),
                  createTableCell("ลบข้อมูลภาพยนตร์ออกจากฐานข้อมูล", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("PATCH", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "D97706" }),
                  createTableCell("/api/admin/users", { width: 3400 }),
                  createTableCell("Admin เท่านั้น", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "DC2626" }),
                  createTableCell("ปรับปรุงข้อมูลผู้ใช้ และแก้ไขสิทธิ์ผู้ใช้งาน (USER ↔ ADMIN)", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("DELETE", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "DC2626", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/admin/users", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("Admin เท่านั้น", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "DC2626", bg: TABLE_ROW_ALT }),
                  createTableCell("ลบบัญชีผู้ใช้งานออกจากระบบ", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/admin/reviews/[id]/approve", { width: 3400 }),
                  createTableCell("Admin เท่านั้น", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "DC2626" }),
                  createTableCell("อนุมัติคำขอแก้ไขรีวิว (นำ pendingContent มาใช้จริง)", { width: 3360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7", bg: TABLE_ROW_ALT }),
                  createTableCell("/api/admin/reviews/[id]/reject", { width: 3400, bg: TABLE_ROW_ALT }),
                  createTableCell("Admin เท่านั้น", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "DC2626", bg: TABLE_ROW_ALT }),
                  createTableCell("ปฏิเสธคำขอแก้ไขรีวิวและล้าง pending status", { width: 3360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("POST", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "0284C7" }),
                  createTableCell("/api/admin/sync-providers", { width: 3400 }),
                  createTableCell("Admin เท่านั้น", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "DC2626" }),
                  createTableCell("สั่งซิงค์ข้อมูล Watch Providers ล่าสุดจาก TMDb API", { width: 3360 }),
                ],
              }),
            ],
          }),

          createSubHeading("จุด Authorization ที่ทำจริง (ใครทำอะไรได้บ้าง):"),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "1. ผู้ใช้ทั่วไป (Guest / Unauthenticated): ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({
                text: "สามารถเข้าชมหน้าแรก, ค้นหาภาพยนตร์ด้วยภาษาไทยธรรมชาติ (Smart Multi-tag Search), กรองตามหมวดหมู่อารมณ์, กดสุ่มภาพยนตร์ (Random Movie), ดูรายละเอียดภาพยนตร์/ตัวอย่าง YouTube, อ่านคะแนนและรีวิวทั้งหมด, และกดลิงก์ไปยังแพลตฟอร์มสตรีมมิ่งจริง",
                size: 20,
                font: FONT_NAME,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "2. สมาชิกที่เข้าสู่ระบบ (User / Authenticated): ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({
                text: "ได้รับสิทธิ์ของ Guest ทั้งหมด เพิ่มเติมคือ สามารถเขียนรีวิวและให้คะแนนภาพยนตร์ (1-5 ดาว), จัดการแก้ไขหรือส่งคำขอแก้ไขรีวิวของตนเอง, ลบรีวิวของตนเอง (ไม่สามารถแก้ไขหรือลบรีวิวของสมาชิกท่านอื่นได้), เพิ่มและจัดการรายการ Watchlist และ Favorites ในหน้าโปรไฟล์ส่วนตัว, และเปลี่ยนรูปโปรไฟล์ Avatar",
                size: 20,
                font: FONT_NAME,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({ text: "3. ผู้ดูแลระบบ (Admin): ", bold: true, size: 20, font: FONT_NAME }),
              new TextRun({
                text: "ได้รับสิทธิ์ของ User ทั้งหมด เพิ่มเติมคือ สิทธิ์เข้าถึงหน้า Admin Dashboard (/admin), สิทธิ์เพิ่ม/ลบภาพยนตร์, สิทธิ์จัดการผู้ใช้งานและเปลี่ยน Role, สิทธิ์ตรวจสอบ Moderation รีวิว (อนุมัติหรือปฏิเสธคำขอแก้ไขรีวิว), สิทธิ์ลบรีวิวที่ไม่เหมาะสมของสมาชิกใดๆ ในระบบ, และสิทธิ์สั่งรันระบบ Sync TMDb Watch Providers",
                size: 20,
                font: FONT_NAME,
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 5
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 5 — Security & Technical Quality"),
          createParagraph("ยืนยันมาตรการรักษาความปลอดภัยและคุณภาพทางเทคนิคที่ทำจริงในระบบ:", { bold: true, before: 40, after: 60 }),

          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell("สถานะ", { width: 1200, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                  createTableCell("มาตรการความปลอดภัย (Security Checklist)", { width: 3800, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("รายละเอียดการทำงานในโค้ดจริง", { width: 4360, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ผ่าน", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                  createTableCell("รหัสผ่านเข้ารหัสด้วย bcrypt ไม่เก็บเป็น plain text", { width: 3800, bold: true }),
                  createTableCell("ใช้ฟังก์ชัน bcrypt.hash(password, 10) ในการเข้ารหัสรหัสผ่านก่อนบันทึกลงฐานข้อมูลใน API สมัครสมาชิก และใช้ bcrypt.compare ในการตรวจสอบตอนล็อกอิน", { width: 4360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ผ่าน", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                  createTableCell("ใช้ Prisma Client ในการ query ทั้งหมด (ไม่มี raw SQL ที่เสี่ยง SQL Injection)", { width: 3800, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("ทุกคำสั่งติดต่อฐานข้อมูลใช้ Prisma ORM Query API แบบ Parameterized Queries 100% เช่น prisma.movie.findMany(), prisma.review.create() ป้องกัน SQL Injection อย่างสมบูรณ์", { width: 4360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ผ่าน", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                  createTableCell("ป้องกัน XSS — ไม่ใช้ dangerouslySetInnerHTML กับข้อมูลที่ผู้ใช้กรอกโดยไม่ sanitize", { width: 3800, bold: true }),
                  createTableCell("การเรนเดอร์ใน React JSX มีกลไก Escape HTML อัตโนมัติ ไม่มีการใช้ dangerouslySetInnerHTML กับข้อความรีวิว ชื่อผู้ใช้ หรือข้อมูลนำเข้าจากผู้ใช้", { width: 4360 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ผ่าน", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                  createTableCell("ตรวจสอบข้อมูลนำเข้าด้วย Zod schema ก่อนบันทึกลงฐานข้อมูล", { width: 3800, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("ใช้ Zod schema ในการ validate รูปแบบอีเมล, ความยาวรหัสผ่าน, ช่วงคะแนน Rating (1-5), ความยาวเนื้อหารีวิว และชนิดข้อมูลใน Request Body ทุกจุด", { width: 4360, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ผ่าน", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                  createTableCell("มี Authorization check ป้องกันผู้ใช้แก้ไข/ลบข้อมูลของคนอื่น", { width: 3800, bold: true }),
                  createTableCell("ตรวจสอบ JWT Token จาก HTTP-only Cookie ในทุก Mutation Request และเช็ค userId เจ้าของรีวิวตรงกับ Session ก่อนอนุญาตให้แก้ไขหรือลบ ป้องกัน Insecure Direct Object Reference (IDOR)", { width: 4360 }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 6
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 6 — Git Workflow & Deployment"),
          createSubHeading("สรุป Branching/PR Workflow ที่ทีมใช้ตลอดโปรเจกต์:"),
          createParagraph(
            "ทีมพัฒนาได้นำแนวทาง GitHub Flow มาประยุกต์ใช้ในการทำงานร่วมกันอย่างมีประสิทธิภาพ:",
            { before: 40, after: 40 }
          ),
          createBullet(" กิ่งหลักสำหรับโค้ดเวอร์ชันที่พร้อมส่งมอบและผ่านการทดสอบแล้ว โดยเชื่อมโยงกับการ Deploy ขึ้น Production Server", "• Main Branch: "),
          createBullet(" แยก Feature Branches ตามโมดูลฟังก์ชัน เช่น feature/auth-jwt, feature/smart-search, feature/reviews-crud, feature/admin-dashboard", "• Feature Branching: "),
          createBullet(" เมื่อพัฒนาแต่ละฟีเจอร์เสร็จสิ้น สมาชิกจะสร้าง Pull Request เพื่อให้สมาชิกในทีมทำการ Code Review ตรวจสอบความถูกต้องและร่วมทดสอบก่อนทำการ Merge", "• Pull Request & Code Review: "),
          createBullet(" ใช้ Commit Message ที่ชัดเจนและสื่อความหมาย เช่น feat:, fix:, refactor:, chore: ช่วยให้ตรวจสอบประวัติการพัฒนาได้ง่าย", "• Clean Git History: "),

          createSubHeading("ปัญหาที่เจอระหว่าง Deploy และวิธีแก้:"),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell("ปัญหาที่พบระหว่าง Deploy", { width: 4500, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("วิธีแก้ไขของทีม", { width: 4860, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("1. การตั้งค่า Nginx Reverse Proxy สำหรับ Next.js Static Assets (/_next/)", { width: 4500, bold: true }),
                  createTableCell("เขียน script คอนฟิก Nginx เพิ่ม location block สำหรับ /_next/ ให้ forward traffic ไปยัง Node.js PM2 พอร์ต 3000 พร้อมเปิด HTTP/1.1 และ WebSocket Upgrade Header", { width: 4860 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("2. การ Build Prisma Client บน Server Production สภาพแวดล้อม Linux", { width: 4500, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("เพิ่มคำสั่ง `npx prisma generate` ในขั้นตอน Build Process ก่อนสั่ง `next build` ใน deploy.sh เพื่อให้ binary engines ตรงกับระบบปฏิบัติการ Ubuntu", { width: 4860, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("3. กระบวนการอัปเดตและ Restart เซิร์ฟเวอร์แบบ Zero-downtime", { width: 4500, bold: true }),
                  createTableCell("สร้าง shell script deploy.sh แบบอัตโนมัติ สั่ง git pull, install dependencies, build, reload PM2 process และ reload Nginx ในคำสั่งเดียว", { width: 4860 }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 7
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 7 — การทดสอบระบบ (Testing)"),
          createSubHeading("วิธีที่ทีมทดสอบระบบก่อนนำเสนอ (Manual Test Cases หลักๆ ที่ตรวจแล้ว):"),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell("รหัสทดสอบ", { width: 1200, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                  createTableCell("กรณีทดสอบ (Test Case)", { width: 2800, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("ขั้นตอนและผลลัพธ์ที่คาดหวัง", { width: 3960, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("ผลการตรวจ", { width: 1400, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("TC-01", { width: 1200, align: AlignmentType.CENTER, bold: true }),
                  createTableCell("ระบบ Authentication & Session", { width: 2800 }),
                  createTableCell("ทดสอบสมัครสมาชิก, ป้อนรหัสผ่านไม่ตรง, ล็อกอินด้วย credentials ที่ถูกต้อง และตรวจสอบว่ามี JWT Cookie ถูกต้อง ปลอดภัย", { width: 3960 }),
                  createTableCell("Passed (ผ่าน)", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("TC-02", { width: 1200, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("Smart Multi-tag Fuzzy Search", { width: 2800, bg: TABLE_ROW_ALT }),
                  createTableCell("ทดสอบค้นหาด้วยภาษาไทยผสม เช่น 'ผู้หญิงถือปืนต่างโลก', 'ตลกไซไฟ', 'ผีไทยหลอนๆ' และคำที่สะกดผิดเล็กน้อย ระบบจัดอันดับภาพยนตร์ที่ตรงได้อย่างแม่นยำ", { width: 3960, bg: TABLE_ROW_ALT }),
                  createTableCell("Passed (ผ่าน)", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("TC-03", { width: 1200, align: AlignmentType.CENTER, bold: true }),
                  createTableCell("Where to Watch & Movie Details", { width: 2800 }),
                  createTableCell("เปิดดูหน้ารายละเอียดภาพยนตร์ ตรวจสอบการเล่น YouTube Trailer และการแสดงผลไอคอนพร้อมลิงก์ไปยัง Netflix, Disney+, Prime Video", { width: 3960 }),
                  createTableCell("Passed (ผ่าน)", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("TC-04", { width: 1200, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("Review CRUD & Authorization", { width: 2800, bg: TABLE_ROW_ALT }),
                  createTableCell("ผู้ใช้เขียนรีวิวและให้คะแนน 1-5 ดาว, แก้ไข/ลบรีวิวตนเองสำเร็จ, และทดสอบส่งคำขอจาก User อื่นเพื่อลบ/แก้รีวิวผู้อื่น ระบบปฏิเสธอย่างถูกต้อง (HTTP 403)", { width: 3960, bg: TABLE_ROW_ALT }),
                  createTableCell("Passed (ผ่าน)", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("TC-05", { width: 1200, align: AlignmentType.CENTER, bold: true }),
                  createTableCell("Watchlist & Favorites", { width: 2800 }),
                  createTableCell("กดปุ่มบันทึกเข้า Watchlist และ Favorite จากหน้ารายละเอียดหนัง จากนั้นตรวจสอบในหน้า Profile ว่าแสดงรายการครบถ้วนและลบออกได้", { width: 3960 }),
                  createTableCell("Passed (ผ่าน)", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("TC-06", { width: 1200, align: AlignmentType.CENTER, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("Admin Dashboard & Moderation", { width: 2800, bg: TABLE_ROW_ALT }),
                  createTableCell("ทดสอบเข้า /admin ด้วยสิทธิ์ USER (Redirect/Forbidden) และล็อกอินด้วย ADMIN สามารถเพิ่ม/ลบหนัง และอนุมัติคำขอแก้ไขรีวิวได้สำเร็จ", { width: 3960, bg: TABLE_ROW_ALT }),
                  createTableCell("Passed (ผ่าน)", { width: 1400, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 8
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 8 — Screenshot หน้าจอหลักของระบบจริง"),
          createParagraph("แนบโครงสร้างและผลลัพธ์หน้าจอของระบบที่ทำงานได้จริง (Live Web Application):", { bold: true, before: 40, after: 80 }),

          createSubHeading("หน้าจอที่ 1: หน้าแรก (Home Page) / Hero Carousel & Movie Recommendations"),
          createScreenMockupCard(
            "หน้าแรก (Home Page) - Doo Arai Dee",
            "/",
            [
              "Navbar: โลโก้ Doo Arai Dee, ช่องค้นหาด่วน, เมนูนำทาง (หน้าแรก, หมวดหมู่, สุ่มหนัง, รายการโปรด, เข้าสู่ระบบ)",
              "Hero Carousel: แบนเนอร์ภาพยนตร์ไฮไลท์ขนาดใหญ่ พร้อมปุ่ม 'ดูตัวอย่าง Trailer' และปุ่ม 'สุ่มหนังดูเลย'",
              "Mood & Tag Filter Chips: แถบเลือกอารมณ์หนังภาษาไทย (เช่น 'ตลกเบาสมอง', 'แอ็กชันมันส์ๆ', 'สืบสวนหักมุม', 'ผีไทยหลอนๆ')",
              "Movie Rows (Horizontal Carousel): แถวการ์ดภาพยนตร์แนะนำ, หนังยอดนิยมประจำสัปดาห์, และหนังเข้าใหม่ พร้อมคะแนน IMDb/TMDb",
            ],
            "หน้าหลักทำหน้าที่เป็นศูนย์กลางการค้นพบภาพยนตร์ ผู้ใช้สามารถเลื่อนดูหนังแนะนำตามหมวดหมู่ หรือกดปุ่ม 'สุ่มหนัง' เพื่อให้ระบบเลือกภาพยนตร์ที่น่าสนใจให้ทันทีแบบสุ่ม"
          ),

          new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),

          createSubHeading("หน้าจอที่ 2: หน้ารายละเอียดภาพยนตร์ (Movie Details) & ช่องทางรับชม (Where to Watch) & รีวิว"),
          createScreenMockupCard(
            "หน้ารายละเอียดภาพยนตร์ (Movie Details)",
            "/movies/[id]",
            [
              "Movie Backdrop & Poster: แสดงภาพพื้นหลังและโปสเตอร์ความละเอียดสูง พร้อมปีที่ฉาย ความยาว และหมวดหมู่",
              "YouTube Trailer Embed: เครื่องเล่นวิดีโอตัวอย่างภาพยนตร์แบบฝังจาก YouTube เล่นได้ทันทีโดยไม่ต้องเปลี่ยนหน้า",
              "Where to Watch (TMDb Providers): ไอคอนและปุ่มลิงก์ตรงไปยังแพลตฟอร์มสตรีมมิ่งที่ถูกลิขสิทธิ์ เช่น Netflix, Disney+ Hotstar, Prime Video, TrueID",
              "Cast & Director: ข้อมูลรายชื่อนักแสดงนำและผู้กำกับ",
              "Review & Rating Section: ส่วนแสดงคะแนนเฉลี่ยจากผู้ใช้, ฟอร์มเขียนรีวิวพร้อมให้คะแนน 1-5 ดาว, และรายการรีวิวจากคอมมูนิตี้",
            ],
            "หน้ารายละเอียดช่วยให้ผู้ใช้ได้รับข้อมูลครบถ้วนสำหรับการตัดสินใจ ทั้งคลิปตัวอย่าง คำวิจารณ์ และที่สำคัญที่สุดคือปุ่มกดไปดูบนแพลตฟอร์มสตรีมมิ่งจริงได้ทันที"
          ),

          new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),

          createSubHeading("หน้าจอที่ 3: ระบบค้นหาอัจฉริยะ (Smart Multi-tag Search Results)"),
          createScreenMockupCard(
            "หน้าค้นหาอัจฉริยะ (Smart Search)",
            "/search?q=ผู้หญิงถือปืนต่างโลก",
            [
              "Smart Search Bar: ช่องค้นหาที่รองรับข้อความภาษาไทยยาวๆ และคำบรรยายตามความรู้สึก",
              "Tag Translation Badges: แสดงคำแปลและแท็กที่ระบบจับคู่ได้ (เช่น 'female-protagonist', 'gun-action', 'isekai / other-world')",
              "Match Score & Relevance: ระบบเรียงลำดับภาพยนตร์ตามความตรงของเนื้อหาและแท็ก",
              "Search Results Grid: ตารางแสดงการ์ดภาพยนตร์ที่ค้นพบ พร้อมคะแนนและหมวดหมู่ที่ตรงกับคำค้นหา",
            ],
            "ผู้ใช้สามารถพิมพ์ประโยคภาษาไทยธรรมชาติ เช่น 'ผู้หญิงถือปืนต่างโลก' หรือ 'หนังไซไฟหุ่นยนต์ยิงกัน' ระบบจะแปลงเป็น Tag และค้นหาหนังที่ตรงใจได้อย่างแม่นยำ"
          ),

          new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),

          createSubHeading("หน้าจอที่ 4: หน้าผู้ดูแลระบบ (Admin Dashboard & Review Moderation)"),
          createScreenMockupCard(
            "แดชบอร์ดผู้ดูแลระบบ (Admin Dashboard)",
            "/admin",
            [
              "Statistics Overview: สรุปจำนวนผู้ใช้งาน, จำนวนภาพยนตร์, จำนวนรีวิวทั้งหมด, และจำนวนคลิกช่องทางสตรีมมิ่ง",
              "Movie Management Table: ตารางรายการภาพยนตร์ พร้อมปุ่มเพิ่มหนังใหม่ (Add Movie) และลบหนัง (Delete)",
              "User Role Management: ตารางจัดการผู้ใช้ พร้อมปุ่มปรับสิทธิ์ USER ↔ ADMIN และการลบบัญชี",
              "Review Moderation Queue: ตารางคำขอแก้ไขรีวิว (Pending Review Edits) พร้อมปุ่ม 'อนุมัติ (Approve)' และ 'ปฏิเสธ (Reject)'",
              "Sync TMDb Providers: ปุ่มสั่งอัปเดตข้อมูลสตรีมมิ่งล่าสุดจาก TMDb API",
            ],
            "ระบบหลังบ้านเฉพาะสิทธิ์ ADMIN ช่วยควบคุมคุณภาพเนื้อหา ตรวจสอบคำขอแก้ไขรีวิวเพื่อป้องกันการสแปม และดูแลฐานข้อมูลภาพยนตร์ได้อย่างมีประสิทธิภาพ"
          ),

          // -------------------------------------------------------------
          // SECTION 9
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 9 — ปัญหาที่พบและบทเรียนที่ได้"),
          createSubHeading("ปัญหา/อุปสรรคสำคัญที่เจอตลอดโปรเจกต์และวิธีที่ทีมแก้ไข:"),
          createParagraph(
            "1. ความท้าทายในการค้นหาภาษาไทย (Thai Natural Language & Tag Matching): เนื่องจากคลังข้อมูลภาพยนตร์ระดับสากล (TMDb) ใช้ภาษาอังกฤษเป็นหลัก และคำค้นภาษาไทยมีความกำกวม ไม่มีการเว้นวรรคคำ ทีมจึงแก้ไขด้วยการพัฒนา thaiTagDictionary เป็นตัวเชื่อมโยงคำไทยกับแท็กภาษาอังกฤษ พร้อมทั้งนำ Fuse.js fuzzy search และ Levenshtein distance มาตรวจจับคำใกล้เคียง ทำให้รองรับคำค้นภาษาไทยและคำพิมพ์ผิดได้อย่างมีประสิทธิภาพ",
            { before: 40, after: 40 }
          ),
          createParagraph(
            "2. การจัดการสิทธิ์และกระบวนการแก้ไขรีวิว (Review Moderation Flow): ในตอนแรกการแก้ไขรีวิวอาจทำให้คะแนนเดิมเปลี่ยนแปลงทันทีโดยยังไม่ได้รับการตรวจสอบ ทีมจึงได้ออกแบบ Schema เพิ่มฟิลด์ pendingContent, pendingRating และสถานะ editStatus (Enum: NONE, PENDING, APPROVED, REJECTED) เพื่อให้แอดมินตรวจสอบก่อนนำข้อมูลที่แก้ไขไปแสดงผลจริง",
            { before: 40, after: 40 }
          ),
          createParagraph(
            "3. การ Deploy บน Cloud VPS และการตั้งค่า Reverse Proxy: พบความซับซ้อนในการจัดการ Nginx กับ Next.js 16 และ WebSocket ทีมได้สร้าง deploy.sh script ที่เป็น Automated Deployment Script ทำให้การอัปเดตโค้ดขึ้น Server เป็นไปอย่างราบรื่นและมีเสถียรภาพ",
            { before: 40, after: 80 }
          ),

          createSubHeading("สิ่งที่เรียนรู้ในภาพรวม และสิ่งที่จะพัฒนาต่อถ้ามีเวลาเพิ่ม:"),
          createParagraph(
            "• สิ่งที่เรียนรู้ในภาพรวม: ได้เรียนรู้การออกแบบและพัฒนา Full-stack Web Application ด้วยเทคโนโลยีสมัยใหม่ (Next.js 16, TypeScript, Prisma ORM, PostgreSQL) อย่างเต็มรูปแบบ เข้าใจหลักการความปลอดภัยด้านเว็บ (Authentication, JWT Cookie, bcrypt, IDOR Prevention, SQL Injection Prevention) และการทำงานร่วมกันเป็นทีมผ่าน Git Workflow",
            { before: 40, after: 40 }
          ),
          createParagraph(
            "• สิ่งที่จะพัฒนาต่อยอดในอนาคต: พัฒนาระบบ AI Recommendation Engine โดยใช้ Vector Embeddings และ Large Language Models (LLM) เพื่อให้เข้าใจความรู้สึกและบริบทที่ซับซ้อนของผู้ใช้ได้ลึกซึ้งยิ่งขึ้น, เพิ่มระบบ Notification แจ้งเตือนเมื่อภาพยนตร์เรื่องโปรดเข้าฉายในสตรีมมิ่ง, และพัฒนาระบบคอมมูนิตี้สำหรับสร้าง Movie List เพื่อแชร์ต่อให้เพื่อนๆ ได้",
            { before: 40, after: 120 }
          ),

          // -------------------------------------------------------------
          // SECTION 10
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 10 — Reflection รายบุคคล"),
          createParagraph("สมาชิกทุกคนกรอกส่วนของตัวเอง — ใช้ประกอบการประเมิน Individual Reflection & Contribution (5 คะแนน)", { italic: true, size: 20, color: "64748B", before: 20, after: 60 }),

          // Member 1 Box
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                    margins: { top: 140, bottom: 140, left: 160, right: 160 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                      bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                      left: { style: BorderStyle.SINGLE, size: 12, color: PRIMARY_COLOR },
                      right: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 20, after: 40 },
                        children: [
                          new TextRun({ text: "สมาชิกคนที่ 1 — ชื่อ-นามสกุล: ", bold: true, size: 22, font: FONT_NAME }),
                          new TextRun({ text: "ปริญญาธรณ์ นาคิน          ", bold: true, size: 22, font: FONT_NAME }),
                          new TextRun({ text: "รหัสนิสิต: ", bold: true, size: 22, font: FONT_NAME }),
                          new TextRun({ text: "6720210043", bold: true, size: 22, font: FONT_NAME }),
                        ],
                      }),
                      createParagraph(
                        "บทบาท/สิ่งที่รับผิดชอบหลักในโปรเจกต์: พัฒนาระบบ Authentication (JWT Session, bcrypt), Smart Multi-tag Search Engine (Fuzzy Search + Thai Dictionary), หน้ารายการ/รายละเอียดภาพยนตร์, ระบบสุ่มหนัง (Random Movie Picker), และระบบ Watchlist/Favorites/Profile Settings",
                        { bold: false, size: 20, before: 40, after: 40 }
                      ),
                      createParagraph(
                        "สิ่งที่ได้เรียนรู้/ทักษะที่พัฒนาขึ้นระหว่างทำโปรเจกต์นี้: ได้พัฒนาทักษะการสร้างเว็บแอปพลิเคชันด้วย Next.js App Router และ React 19 อย่างลึกซึ้ง, เข้าใจการจัดการ State และการออกแบบ UI ที่เป็น Responsive ด้วย Tailwind CSS, รวมถึงการนำหลักการทางคณิตศาสตร์อย่าง Levenshtein distance มาประยุกต์ใช้กับการค้นหาภาษาไทยจริง",
                        { bold: false, size: 20, before: 40, after: 40 }
                      ),
                      createParagraph(
                        "ความท้าทายส่วนตัวที่เจอ และวิธีที่จัดการ/แก้ปัญหา: ความท้าทายเรื่องการตัดคำและการจับคู่คำค้นภาษาไทยที่มีความหมายหลากหลาย ได้แก้ไขโดยการรวบรวมคำศัพท์คำพ้องความหมาย (Synonyms) ลงใน thaiTagDictionary และตั้งค่าน้ำหนัก (Weights) ของฟิลด์ต่างๆ ใน Fuse.js ให้เหมาะสม ทำให้ระบบค้นหาให้ผลลัพธ์ที่น่าประทับใจ",
                        { bold: false, size: 20, before: 40, after: 40 }
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),

          // Member 2 Box
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                    margins: { top: 140, bottom: 140, left: 160, right: 160 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                      bottom: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                      left: { style: BorderStyle.SINGLE, size: 12, color: PRIMARY_COLOR },
                      right: { style: BorderStyle.SINGLE, size: 6, color: "CBD5E1" },
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 20, after: 40 },
                        children: [
                          new TextRun({ text: "สมาชิกคนที่ 2 — ชื่อ-นามสกุล: ", bold: true, size: 22, font: FONT_NAME }),
                          new TextRun({ text: "กิตติศักดิ์ นวลประจักร์          ", bold: true, size: 22, font: FONT_NAME }),
                          new TextRun({ text: "รหัสนิสิต: ", bold: true, size: 22, font: FONT_NAME }),
                          new TextRun({ text: "6720210100", bold: true, size: 22, font: FONT_NAME }),
                        ],
                      }),
                      createParagraph(
                        "บทบาท/สิ่งที่รับผิดชอบหลักในโปรเจกต์: พัฒนาระบบรีวิวภาพยนตร์ (Review CRUD & Rating System), ระบบแนะนำช่องทางรับชมจริง (Where to Watch: TMDb Providers), ระบบแอดมิน (Admin Dashboard), ระบบความปลอดภัยและ Review Moderation Workflow, และการเขียนสคริปต์ Deployment อัตโนมัติ",
                        { bold: false, size: 20, before: 40, after: 40 }
                      ),
                      createParagraph(
                        "สิ่งที่ได้เรียนรู้/ทักษะที่พัฒนาขึ้นระหว่างทำโปรเจกต์นี้: ได้ฝึกฝนการออกแบบ Schema และจัดการความสัมพันธ์ข้อมูลบน PostgreSQL ด้วย Prisma ORM, เรียนรู้การจัดการสิทธิ์ Role-based Access Control (RBAC), การเชื่อมต่อ External API ของ TMDb และการดูแลเซิร์ฟเวอร์ Production ด้วย Nginx และ PM2",
                        { bold: false, size: 20, before: 40, after: 40 }
                      ),
                      createParagraph(
                        "ความท้าทายส่วนตัวที่เจอ และวิธีที่จัดการ/แก้ปัญหา: ความท้าทายเรื่องการตรวจสอบความถูกต้องของข้อมูลรีวิวและป้องกันการลบข้อมูลโดยผู้ใช้คนอื่น ได้แก้ไขโดยการวางโครงสร้าง Middleware ตรวจสอบ JWT Cookie ทุกครั้ง และใช้ Zod schema ตรวจสอบ input อย่างละเอียด ทำให้ระบบมีความปลอดภัยและเสถียรภาพสูง",
                        { bold: false, size: 20, before: 40, after: 40 }
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 11
          // -------------------------------------------------------------
          createSectionHeading("ส่วนที่ 11 — ตรวจสอบ Deliverables ก่อนส่ง"),
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createTableCell("สถานะ", { width: 1200, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT, align: AlignmentType.CENTER }),
                  createTableCell("รายการ Deliverables ที่ต้องส่ง", { width: 4500, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                  createTableCell("รายละเอียด / ลิงก์ที่เกี่ยวข้อง", { width: 3660, bold: true, bg: TABLE_HEADER_BG, textColor: TABLE_HEADER_TEXT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ครบ", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                  createTableCell("ลิงก์ Production Deployment บน Vercel/VPS ที่ใช้งานได้จริง", { width: 4500, bold: true }),
                  createTableCell("https://dooaraidee.online/", { width: 3660, bold: true, textColor: "0284C7" }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ครบ", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                  createTableCell("ลิงก์ GitHub Repository ที่มีประวัติ branch / PR / Code Review", { width: 4500, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("https://github.com/parinratron-svg/movie-tag-search", { width: 3660, bold: true, textColor: "0284C7", bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ครบ", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                  createTableCell("README.md อธิบายโปรเจกต์ ฟีเจอร์หลัก และวิธีติดตั้งรันบนเครื่อง", { width: 4500, bold: true }),
                  createTableCell("อยู่ใน root repository พร้อมคำอธิบายครบถ้วน", { width: 3660 }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ครบ", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D", bg: TABLE_ROW_ALT }),
                  createTableCell("สไลด์นำเสนอสั้นๆ สำหรับใช้ตอน Demo Day", { width: 4500, bold: true, bg: TABLE_ROW_ALT }),
                  createTableCell("จัดเตรียมพร้อมสำหรับการนำเสนอในวัน Demo", { width: 3660, bg: TABLE_ROW_ALT }),
                ],
              }),
              new TableRow({
                children: [
                  createTableCell("☑ ครบ", { width: 1200, align: AlignmentType.CENTER, bold: true, textColor: "15803D" }),
                  createTableCell("รายงานฉบับสมบูรณ์นี้ กรอกครบทุกส่วน รวม Reflection รายบุคคล", { width: 4500, bold: true }),
                  createTableCell("กรอกข้อมูลครบถ้วนสมบูรณ์ทั้ง 11 ส่วน", { width: 3660 }),
                ],
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 60 },
            children: [
              new TextRun({
                text: "ลงชื่อสมาชิกทุกคน (ยืนยันว่าได้ตรวจสอบเนื้อหารายงานนี้ ร่วมกัน):",
                bold: true,
                size: 22,
                color: "1E293B",
                font: FONT_NAME,
              }),
            ],
          }),

          new Table({
            width: { size: 9360, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 4680, type: WidthType.DXA },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 120, after: 40 },
                        children: [
                          new TextRun({ text: "ลงชื่อ ...........................................................", size: 20, font: FONT_NAME }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 20, after: 20 },
                        children: [
                          new TextRun({ text: "( ปริญญาธรณ์ นาคิน )", bold: true, size: 20, font: FONT_NAME }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 20, after: 20 },
                        children: [
                          new TextRun({ text: "สมาชิกคนที่ 1", size: 18, color: "64748B", font: FONT_NAME }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 4680, type: WidthType.DXA },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 120, after: 40 },
                        children: [
                          new TextRun({ text: "ลงชื่อ ...........................................................", size: 20, font: FONT_NAME }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 20, after: 20 },
                        children: [
                          new TextRun({ text: "( กิตติศักดิ์ นวลประจักร์ )", bold: true, size: 20, font: FONT_NAME }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 20, after: 20 },
                        children: [
                          new TextRun({ text: "สมาชิกคนที่ 2", size: 18, color: "64748B", font: FONT_NAME }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 140, after: 40 },
            children: [
              new TextRun({ text: "วันที่ส่ง: ", bold: true, size: 22, font: FONT_NAME }),
              new TextRun({ text: "17 กันยายน 2569", size: 22, font: FONT_NAME }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(process.cwd(), "final_project_report.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated document at: ${outPath}`);
}

buildDocument().catch((err) => {
  console.error("Error generating document:", err);
  process.exit(1);
});

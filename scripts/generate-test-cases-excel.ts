import ExcelJS from "exceljs";
import path from "path";

async function generateTestCasesExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "QA Test Automation Team";
  workbook.lastModifiedBy = "Antigravity";
  workbook.created = new Date();
  workbook.modified = new Date();

  // 1. Worksheet: Test Cases & Results
  const sheet = workbook.addWorksheet("Test Cases & Results", {
    views: [{ showGridLines: true }],
  });

  // Setup Columns to match the requested format
  sheet.columns = [
    { key: "id", width: 15 },
    { key: "section", width: 22 },
    { key: "function", width: 24 },
    { key: "desc", width: 44 },
    { key: "dataTest", width: 36 },
    { key: "testStep", width: 46 },
    { key: "expectedResult", width: 40 },
    { key: "status", width: 12 },
  ];

  // Helper styles
  const headerFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFB4C6E7" }, // Soft blue header as in example
  };

  const sectionFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" }, // Soft highlight for category titles
  };

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FF808080" } },
    left: { style: "thin", color: { argb: "FF808080" } },
    bottom: { style: "thin", color: { argb: "FF808080" } },
    right: { style: "thin", color: { argb: "FF808080" } },
  };

  const borderHeader: Partial<ExcelJS.Borders> = {
    top: { style: "medium", color: { argb: "FF404040" } },
    left: { style: "thin", color: { argb: "FF404040" } },
    bottom: { style: "medium", color: { argb: "FF404040" } },
    right: { style: "thin", color: { argb: "FF404040" } },
  };

  // API & Database Logic Tests Only (No Browser goto)
  const modules = [
    {
      title: "RANDOM MOVIE SYSTEM (ระบบสุ่มภาพยนตร์ - ทดสอบผ่าน API & Logic)",
      testCases: [
        {
          id: "TC-RND-001",
          section: "Random API",
          function: "GET /api/random (Guest)",
          desc: "สุ่มภาพยนตร์แบบผู้ใช้ทั่วไปไม่ล็อกอิน (Guest - Global Random Pool)",
          dataTest: "Endpoint: GET /api/random\nHeaders: ไม่มี Cookie session",
          testStep: "1. ส่งคำขอ GET ไปที่ /api/random\n2. ตรวจสอบ HTTP Status Code\n3. ตรวจสอบโครงสร้าง JSON และรหัสภาพยนตร์ (id)",
          expectedResult: "ตอบกลับ HTTP 200 พร้อม Object ภาพยนตร์ที่ถูกต้องและมีอยู่ในฐานข้อมูลจริง",
          status: "Pass",
        },
        {
          id: "TC-RND-002",
          section: "Random API",
          function: "GET /api/random (User)",
          desc: "สุ่มภาพยนตร์แบบผู้ใช้ล็อกอิน (Personalized Smart Pool จากประวัติการดู)",
          dataTest: "Endpoint: GET /api/random\nHeaders: Cookie: session=<valid_token>\nUser History: แนว Action, Sci-Fi",
          testStep: "1. สร้าง Session Token จำลองผู้ใช้ล็อกอิน\n2. ส่งคำขอ GET /api/random พร้อม Cookie\n3. ตรวจสอบภาพยนตร์ที่ได้รับเทียบกับประวัติการดู",
          expectedResult: "ตอบกลับ HTTP 200 และได้ภาพยนตร์ที่สอดคล้องกับแนวหนังโปรดในประวัติการดู",
          status: "Pass",
        },
        {
          id: "TC-RND-003",
          section: "Random Logic",
          function: "Distribution Engine",
          desc: "ตรวจสอบการกระจายตัวของผลลัพธ์การสุ่มต่อเนื่องหลายครั้ง",
          dataTest: "สุ่มต่อเนื่อง 5 ครั้ง (Multiple API Requests)\nPool: ภาพยนตร์ทั้งหมดในระบบ",
          testStep: "1. เรียก API /api/random ซ้ำกัน 5 ครั้ง\n2. รวบรวมรายชื่อและรหัสภาพยนตร์\n3. ตรวจสอบความหลากหลายและความถูกต้องกับ DB",
          expectedResult: "ได้ภาพยนตร์ที่ถูกต้องทั้งหมด มีการกระจายตัวของผลลัพธ์ ไม่ล็อกผลซ้ำเดิมตลอด",
          status: "Pass",
        },
        {
          id: "TC-RND-004",
          section: "Random Logic",
          function: "Fallback Mechanism",
          desc: "สุ่มภาพยนตร์กรณีผู้ใช้ล็อกอินแต่ยังไม่มีประวัติการดู (Fallback to Global Pool)",
          dataTest: "Cookie: session=<token_new_user>\nสถานะ: ผู้ใช้ใหม่ยังไม่มีประวัติการดู",
          testStep: "1. ส่งคำขอ GET /api/random ด้วย User ที่ไม่มีประวัติ\n2. ตรวจสอบกระบวนการ Fallback ไปสุ่มจาก Pool รวม",
          expectedResult: "ตอบกลับ HTTP 200 สุ่มภาพยนตร์จากคลังทั้งหมดได้ปกติโดยไม่เกิด Error 500",
          status: "Pass",
        },
        {
          id: "TC-RND-005",
          section: "Random Logic",
          function: "Data Validation",
          desc: "ตรวจสอบความครบถ้วนของข้อมูลภาพยนตร์ที่ได้จากการสุ่ม (id, title, genres)",
          dataTest: "Endpoint: GET /api/random\nResponse Payload validation",
          testStep: "1. ส่งคำขอ GET /api/random\n2. ตรวจสอบ Key สำคัญใน JSON (id, title, genres, posterUrl)",
          expectedResult: "โครงสร้างข้อมูลถูกต้องครบถ้วนตาม Schema พร้อมนำไปแสดงผล",
          status: "Pass",
        },
      ],
    },
    {
      title: "WATCH HISTORY SYSTEM (ระบบประวัติการดูภาพยนตร์ - ทดสอบผ่าน API & DB Logic)",
      testCases: [
        {
          id: "TC-HIST-001",
          section: "Views API",
          function: "POST /api/views (Guest)",
          desc: "ผู้ใช้ที่ยังไม่ได้ล็อกอินเปิดดูหนัง ระบบจะไม่บันทึกประวัติ (Guest Skip)",
          dataTest: "Endpoint: POST /api/views\nHeaders: ไม่มี Cookie session\nBody: { \"movieId\": \"<test_movie_id>\" }",
          testStep: "1. ส่งคำขอ POST /api/views โดยไม่ใส่ Auth Token\n2. ตรวจสอบ Response JSON\n3. ตรวจสอบตาราง ViewHistory ใน Database",
          expectedResult: "ตอบกลับ HTTP 200 พร้อม JSON { skipped: true } และไม่มีการเพิ่มแถวลง DB",
          status: "Pass",
        },
        {
          id: "TC-HIST-002",
          section: "Views API",
          function: "Validation (400 Bad Request)",
          desc: "ตรวจสอบ Validation เมื่อไม่ส่ง movieId ใน Request Body",
          dataTest: "Endpoint: POST /api/views\nHeaders: Cookie: session=<token>\nBody: {}",
          testStep: "1. ส่งคำขอ POST /api/views แบบไม่ส่ง Body movieId\n2. ตรวจสอบ HTTP Status และข้อความแจ้งเตือน",
          expectedResult: "ตอบกลับ HTTP 400 Bad Request พร้อมข้อความ error: 'ต้องระบุ movieId'",
          status: "Pass",
        },
        {
          id: "TC-HIST-003",
          section: "Views API",
          function: "Validation (404 Not Found)",
          desc: "ตรวจสอบกรณีส่ง movieId ที่ไม่มีอยู่ในระบบฐานข้อมูล",
          dataTest: "Endpoint: POST /api/views\nHeaders: Cookie: session=<token>\nBody: { \"movieId\": \"invalid-id-99999\" }",
          testStep: "1. ส่งคำขอ POST /api/views พร้อมรหัสหนังที่ไม่มีจริงใน DB\n2. ตรวจสอบ HTTP Status",
          expectedResult: "ตอบกลับ HTTP 404 Not Found พร้อมข้อความ error: 'ไม่พบหนังนี้'",
          status: "Pass",
        },
        {
          id: "TC-HIST-004",
          section: "Views API & DB",
          function: "First-time View Recording",
          desc: "บันทึกประวัติการดูภาพยนตร์ครั้งแรกของผู้ใช้สำเร็จ",
          dataTest: "Headers: Cookie: session=<token>\nBody: { \"movieId\": \"<test_movie_id>\" }\nสถานะ: ยังไม่เคยดูเรื่องนี้",
          testStep: "1. เคลียร์ประวัติเก่าของหนังนี้ใน DB\n2. ส่งคำขอ POST /api/views\n3. Query ตรวจสอบตาราง ViewHistory ใน DB",
          expectedResult: "ตอบกลับ HTTP 200 { success: true }, มี Record เพิ่มใน DB โดยมี viewCount = 1",
          status: "Pass",
        },
        {
          id: "TC-HIST-005",
          section: "Views API & DB",
          function: "Repeat View (Increment)",
          desc: "ดูภาพยนตร์เรื่องเดิมซ้ำ (อัปเดต viewCount เพิ่มขึ้น โดยไม่งอกแถวซ้ำ)",
          dataTest: "Headers: Cookie: session=<token>\nBody: { \"movieId\": \"<test_movie_id>\" }\nสถานะ: ดูซ้ำครั้งที่ 2",
          testStep: "1. ส่งคำขอ POST /api/views สำหรับหนังเรื่องเดิมซ้ำอีกครั้ง\n2. ตรวจสอบจำนวนแถวและค่า viewCount ใน DB",
          expectedResult: "มีแถวเดิมเพียง 1 แถวใน DB (ไม่งอกซ้ำ), ค่า viewCount ปรับเพิ่มเป็น 2 และอัปเดต viewedAt ล่าสุด",
          status: "Pass",
        },
        {
          id: "TC-HIST-006",
          section: "History Data Query",
          function: "Order By ViewedAt",
          desc: "ดึงข้อมูลประวัติการดูและเรียงลำดับตามเวลาล่าสุด (View History Query)",
          dataTest: "userId: <test_user_id>\nQuery: prisma.viewHistory.findMany (orderBy: viewedAt desc)",
          testStep: "1. Query ประวัติการดูของผู้ใช้จาก Database\n2. ตรวจสอบการเรียงลำดับวันเวลา (viewedAt)",
          expectedResult: "ดึงข้อมูลสำเร็จ และเรียงลำดับประวัติจากเรื่องล่าสุดไปหาเรื่องเก่าสุดถูกต้อง",
          status: "Pass",
        },
        {
          id: "TC-HIST-007",
          section: "History Logic",
          function: "Unique Movie Deduplication",
          desc: "ตัดรายการหนังซ้ำและคำนวณจำนวนภาพยนตร์ที่ดูทั้งหมด (Unique Count)",
          dataTest: "ชุดข้อมูล ViewHistory ที่มีประวัติการดูเรื่องเดิมซ้ำกัน",
          testStep: "1. นำรายการ ViewHistory ทั้งหมดของ User มาประมวลผล\n2. คำนวณ Deduplication เพื่อหาจำนวนเรื่องที่ไม่ซ้ำ",
          expectedResult: "คำนวณจำนวนภาพยนตร์ที่ดูทั้งหมด (Unique Movies Count) ได้ถูกต้องแม่นยำ",
          status: "Pass",
        },
        {
          id: "TC-HIST-008",
          section: "History Logic",
          function: "Top Genre Calculation",
          desc: "การประมวลผลหมวดหมู่ที่ดูบ่อยที่สุด (Top Favorite Genres Analysis)",
          dataTest: "ประวัติการดูหนังแนว Action 3 เรื่อง, Comedy 1 เรื่อง",
          testStep: "1. รวบรวม Genres ของภาพยนตร์ทั้งหมดที่ดู\n2. นับความถี่และจัดอันดับหาหมวดหมู่ที่มากที่สุด",
          expectedResult: "ระบุหมวดหมู่โปรดยอดนิยม 'Action' พร้อมนับจำนวนเรื่องได้ตรงตามจริง",
          status: "Pass",
        },
      ],
    },
  ];

  let currentRow = 1;

  for (const mod of modules) {
    // 1. Title Row
    const titleRow = sheet.getRow(currentRow);
    titleRow.values = [mod.title];
    titleRow.height = 26;
    sheet.mergeCells(`A${currentRow}:H${currentRow}`);

    titleRow.getCell(1).font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FF1F497D" },
    };
    titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    titleRow.getCell(1).fill = sectionFill;
    titleRow.getCell(1).border = borderThin;
    currentRow++;

    // 2. Header Row
    const headerRow = sheet.getRow(currentRow);
    headerRow.values = [
      "Test case ID",
      "Section",
      "Function",
      "Desc",
      "Data Test",
      "Test Step",
      "Expected Result",
      "Status",
    ];
    headerRow.height = 24;

    for (let col = 1; col <= 8; col++) {
      const cell = headerRow.getCell(col);
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF000000" } };
      cell.fill = headerFill;
      cell.alignment = {
        vertical: "middle",
        horizontal: col === 1 || col === 8 ? "center" : "left",
      };
      cell.border = borderHeader;
    }
    currentRow++;

    // 3. Data Rows
    for (const tc of mod.testCases) {
      const dataRow = sheet.getRow(currentRow);
      dataRow.values = [
        tc.id,
        tc.section,
        tc.function,
        tc.desc,
        tc.dataTest,
        tc.testStep,
        tc.expectedResult,
        tc.status,
      ];
      dataRow.height = 42;

      for (let col = 1; col <= 8; col++) {
        const cell = dataRow.getCell(col);
        cell.font = { name: "Calibri", size: 9.5 };
        cell.alignment = {
          vertical: "top",
          horizontal: col === 1 || col === 8 ? "center" : "left",
          wrapText: true,
        };
        cell.border = borderThin;

        // Custom styling for Status (Pass)
        if (col === 8) {
          cell.font = {
            name: "Calibri",
            size: 10,
            bold: true,
            color: { argb: tc.status === "Pass" ? "FF006100" : "FF9C0006" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: tc.status === "Pass" ? "FFC6EFCE" : "FFFFC7CE" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      }
      currentRow++;
    }

    // Add empty row separator
    sheet.getRow(currentRow).height = 14;
    currentRow++;
  }

  // Summary Dashboard Sheet
  const summarySheet = workbook.addWorksheet("Summary Dashboard", {
    views: [{ showGridLines: true }],
  });
  summarySheet.columns = [
    { key: "category", width: 42 },
    { key: "total", width: 16 },
    { key: "passed", width: 16 },
    { key: "failed", width: 16 },
    { key: "passRate", width: 18 },
  ];

  // Header for Summary
  const sTitle = summarySheet.getRow(1);
  sTitle.values = ["📊 API & Logic Test Summary (No Browser Go-to)"];
  sTitle.height = 30;
  summarySheet.mergeCells("A1:E1");
  sTitle.getCell(1).font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  sTitle.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF203764" },
  };
  sTitle.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

  const sHeader = summarySheet.getRow(2);
  sHeader.values = ["Test Suite / Module", "Total Tests", "Passed", "Failed", "Pass Rate (%)"];
  sHeader.height = 24;
  for (let c = 1; c <= 5; c++) {
    const cell = sHeader.getCell(c);
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF305496" },
    };
    cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "center" };
    cell.border = borderHeader;
  }

  let sumRowIdx = 3;
  let totalAll = 0;
  let passedAll = 0;

  for (const m of modules) {
    const total = m.testCases.length;
    const passed = m.testCases.filter((tc) => tc.status === "Pass").length;
    const failed = total - passed;
    const rate = ((passed / total) * 100).toFixed(1) + "%";

    totalAll += total;
    passedAll += passed;

    const row = summarySheet.getRow(sumRowIdx);
    row.values = [m.title.split(" (")[0], total, passed, failed, rate];
    row.height = 22;
    for (let c = 1; c <= 5; c++) {
      const cell = row.getCell(c);
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "center" };
      cell.border = borderThin;
      if (c === 5) {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF006100" } };
      }
    }
    sumRowIdx++;
  }

  // Total Summary Row
  const totalRow = summarySheet.getRow(sumRowIdx);
  const overallRate = ((passedAll / totalAll) * 100).toFixed(1) + "%";
  totalRow.values = ["TOTAL SUMMARY", totalAll, passedAll, totalAll - passedAll, overallRate];
  totalRow.height = 26;
  for (let c = 1; c <= 5; c++) {
    const cell = totalRow.getCell(c);
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" },
    };
    cell.alignment = { vertical: "middle", horizontal: c === 1 ? "left" : "center" };
    cell.border = borderHeader;
  }

  const outputPath = path.resolve(process.cwd(), "Test_Cases_Report.xlsx");
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ Excel file regenerated successfully at: ${outputPath}`);
}

generateTestCasesExcel().catch(console.error);

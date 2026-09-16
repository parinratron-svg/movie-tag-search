# 🎬 Doo Arai Dee (ดูอะไรดี)
> **ระบบค้นหาและแนะนำภาพยนตร์ด้วยคำค้นภาษาไทยและแท็กอัจฉริยะ**
> 
> 🌐 **Production Website:** [https://dooaraidee.online/](https://dooaraidee.online/)  
> 📦 **GitHub Repository:** [https://github.com/parinratron-svg/movie-tag-search](https://github.com/parinratron-svg/movie-tag-search)

---

## 📖 1. ภาพรวมโปรเจกต์ (Project Overview)

**Doo Arai Dee (ดูอะไรดี)** ถูกพัฒนาขึ้นเพื่อแก้ปัญหาของผู้ใช้งานที่มักประสบปัญหา *"ไม่รู้จะดูหนังเรื่องอะไรดี"* และไม่สามารถค้นหาภาพยนตร์ให้ตรงกับอารมณ์หรือความรู้สึกในขณะนั้นได้ เนื่องจากแพลตฟอร์มทั่วไปจำกัดการค้นหาอยู่เพียงหมวดหมู่เดียว (Single Genre) และไม่รองรับการพิมพ์บรรยายด้วยภาษาไทยแบบผสมผสานหลายธีม เช่น *"ผู้หญิงถือปืนต่างโลก"*, *"ตลกไซไฟคลายเครียด"* หรือ *"ผีไทยหลอนๆ ยุคเก่า"*

ระบบนี้เปิดให้ผู้ใช้พิมพ์บรรยายสิ่งที่อยากดูเป็นภาษาไทยได้อย่างอิสระ แล้วระบบจะประมวลผลด้วยคลังคำศัพท์ภาษาไทย (**Thai Tag Dictionary**) ร่วมกับ **Fuzzy Search อัจฉริยะ (Fuse.js + Levenshtein Distance)** เพื่อจับคู่และจัดอันดับภาพยนตร์ที่ตรงใจที่สุด พร้อมแสดง **ช่องทางรับชมจริงที่ถูกลิขสิทธิ์ในไทย (Where to Watch: TMDb Watch Providers)** และตัวอย่างภาพยนตร์จาก YouTube เพื่ออำนวยความสะดวกในการตัดสินใจรับชมอย่างครบวงจร

---

## ✨ 2. ฟีเจอร์หลักของระบบ (Key Features)

| ฟีเจอร์หลัก | คำอธิบายการทำงาน | สถานะ |
| :--- | :--- | :---: |
| 🔐 **1. ระบบสมัครสมาชิกและเข้าสู่ระบบ (Authentication)** | สมัครสมาชิก/เข้าสู่ระบบ/ออกจากระบบ จัดการ Session ด้วย JWT (Jose) จัดเก็บใน HTTP-only Cookie ปลอดภัย และเข้ารหัสรหัสผ่านด้วย `bcrypt` | ✅ สำเร็จ |
| 🔍 **2. ระบบค้นหาอัจฉริยะ (Smart Multi-tag Search)** | ค้นหาหนังด้วยภาษาไทยธรรมชาติ แปลงคำค้นเป็น Tag ภาษาอังกฤษด้วยคลังคำศัพท์ไทย และตรวจจับคำสะกดผิดด้วย Fuse.js + Levenshtein distance จัดอันดับตามความตรง | ✅ สำเร็จ |
| 📺 **3. แนะนำช่องทางรับชมจริง (Where to Watch)** | ดึงข้อมูลช่องทางสตรีมมิ่งที่ถูกลิขสิทธิ์ในไทยจาก TMDb Watch Providers (Netflix, Disney+, Prime Video, TrueID ฯลฯ) พร้อมลิงก์ตรงไปยังแพลตฟอร์ม | ✅ สำเร็จ |
| ⭐ **4. ระบบรีวิวและให้คะแนน (Review CRUD & Rating)** | สร้าง แสดงผล แก้ไข และลบรีวิวภาพยนตร์ (1-5 ดาว) พร้อมระบบความปลอดภัยป้องกันแก้ไขรีวิวผู้อื่น และมีระบบ **Request Edit** ส่งคำขอแก้ไขให้อนุมัติ | ✅ สำเร็จ |
| 🎲 **5. ระบบสุ่มหนังอัจฉริยะ (Random Movie Picker)** | ปุ่มสุ่มภาพยนตร์สำหรับผู้ใช้ที่ตัดสินใจไม่ได้ มีเอฟเฟกต์การสุ่มและนำทางไปยังหน้ารายละเอียดทันที | ✅ สำเร็จ |
| 📑 **6. หน้ารายการและรายละเอียดภาพยนตร์ (Movie Details)** | หน้าหลักมี Hero Carousel ไฮไลท์หนัง, หมวดหมู่ Genre/Mood; หน้ารายละเอียดแสดง Trailer YouTube Embed, รายชื่อนักแสดง/ผู้กำกับ และคะแนนเฉลี่ย | ✅ สำเร็จ |
| 💖 **7. รายการโปรดและ Watchlist (Personalization)** | บันทึกหนังที่อยากดูไว้ดูภายหลัง (Watchlist) และบันทึกหนังเรื่องโปรด (Favorites) ลงโปรไฟล์ส่วนตัว | ✅ สำเร็จ |
| 🛡️ **8. ระบบผู้ดูแลระบบ (Admin Dashboard & Moderation)** | แดชบอร์ดเฉพาะ ADMIN สำหรับจัดการเพิ่ม/ลบหนัง, จัดการผู้ใช้และสิทธิ์, ตรวจสอบและอนุมัติ/ปฏิเสธคำขอแก้ไขรีวิว, และซิงค์ข้อมูลกับ TMDb | ✅ สำเร็จ |

---

## 🛠️ 3. สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend (Presentation Layer):**
  * **Next.js 16 (App Router)** & **React 19**
  * **TypeScript** เพื่อ Type-Safety ทั่วทั้งโปรเจกต์
  * **Tailwind CSS v4** ออกแบบ UI ให้ทันสมัย รองรับ Dark Theme และ Responsive ทุกหน้าจอ
  * **Lucide React** ไอคอนสวยงามและสื่อความหมาย
* **Backend & API Layer:**
  * **Next.js Route Handlers (`app/api/*`)**
  * **Zod Schema Validation** ตรวจสอบความถูกต้องของข้อมูล Input ทุกจุด
  * **Jose (JWT)** & **bcrypt** สำหรับจัดการ Session และการแฮชรหัสผ่านอย่างปลอดภัย
* **Search & Business Logic:**
  * **Fuse.js & Levenshtein Algorithm** สำหรับระบบ Fuzzy Tag Matching
  * **Thai Tag Dictionary** สำหรับเชื่อมโยงคำค้นภาษาไทยกับ International Movie Keywords
* **Database & ORM:**
  * **PostgreSQL (Neon Serverless Database)**
  * **Prisma ORM v6 (Prisma Client)** จัดการ Schema, Relations และ Migration
* **External Services & Integrations:**
  * **The Movie Database (TMDb) API v3** (ข้อมูลหนัง โปสเตอร์ นักแสดง และ Watch Providers)
  * **YouTube Embed** สำหรับเครื่องเล่นวิดีโอตัวอย่างภาพยนตร์
* **Infrastructure & Production:**
  * **Cloud VPS Ubuntu 22.04 LTS** / **Vercel**
  * **Nginx Reverse Proxy**, **PM2 Process Manager**, **SSL Let's Encrypt**

---

## 💻 4. โครงสร้างฐานข้อมูล (Database Schema Overview)

* `User`: เก็บข้อมูลผู้ใช้ (id, email, password, name, role [USER/ADMIN], avatarUrl)
* `Movie`: เก็บข้อมูลภาพยนตร์ (tmdbId, title, overview, posterPath, releaseYear, voteAverage, genres, tags, watchProviders, trailerKey, director, cast)
* `Review`: เก็บรีวิวและการให้คะแนน (userId, movieId, rating, content, pendingContent, pendingRating, editStatus [NONE/PENDING/APPROVED/REJECTED])
* `Watchlist` & `Favorite`: เก็บบันทึกรายการโปรดและรายการจะดูภายหลังของผู้ใช้
* `ViewHistory` & `ProviderClick`: เก็บสถิติการเปิดดูหนังและการคลิกช่องทางสตรีมมิ่งเพื่อการวิเคราะห์

---

## 🚀 5. วิธีติดตั้งและรันบนเครื่อง Local (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites):
* **Node.js** เวอร์ชัน `>= 20.x`
* **npm** หรือ **yarn** / **pnpm**
* บัญชีและฐานข้อมูล **PostgreSQL** (หรือใช้ Neon Database ฟรี)
* **TMDb API Key** (ขอฟรีได้ที่ [themoviedb.org](https://www.themoviedb.org/settings/api))

---

### ขั้นตอนการติดตั้ง (Step-by-Step):

#### 1. Clone Repository
```bash
git clone https://github.com/parinratron-svg/movie-tag-search.git
cd movie-tag-search
```

#### 2. ติดตั้ง Dependencies
```bash
npm install
```

#### 3. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วกรอกค่า Configuration:
```bash
cp .env.example .env
```
ตัวอย่างค่าในไฟล์ `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dooaraidee?schema=public"
TMDB_API_KEY="your_tmdb_api_key_v3_here"
JWT_SECRET="your_jwt_super_secret_key_here"
```

#### 4. เชื่อมต่อฐานข้อมูลและสร้างตารางด้วย Prisma
```bash
# Push schema ไปยังฐานข้อมูล
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

#### 5. ดึงข้อมูลภาพยนตร์เริ่มต้น (Seed Data)
สั่งรันสคริปต์เพื่อดึงภาพยนตร์ยอดนิยม ข้อมูลแท็ก โปสเตอร์ และช่องทางสตรีมมิ่งจาก TMDb ลงฐานข้อมูล:
```bash
npm run prisma:seed # หรือ npx tsx prisma/seed.ts
```

#### 6. เริ่มต้นรัน Development Server
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่: **`http://localhost:3000`** เพื่อเริ่มใช้งาน 🎉

---

## 🚢 6. การ Deploy ขึ้น Production (Deployment Guide)

โปรเจกต์นี้รองรับทั้งการ Deploy บน **Vercel** และ **Cloud VPS (Ubuntu Linux)**:

### ตัวอย่างการ Deploy บน VPS ด้วยสคริปต์อัตโนมัติ `deploy.sh`:
```bash
chmod +x deploy.sh
./deploy.sh
```

สคริปต์ `deploy.sh` จะทำงานดังนี้:
1. `git pull origin main` เพื่อดึงโค้ดล่าสุด
2. `npm install` ติดตั้ง dependencies
3. `npx prisma generate` สร้าง binary engine ให้ตรงกับ Linux
4. `npm run build` สร้าง production build
5. `pm2 reload movie-app` รีโหลดโพรเซสแบบ Zero-downtime
6. `sudo systemctl reload nginx` อัปเดต Reverse Proxy

---

## 👥 7. สมาชิกในทีมและบทบาทหน้าที่ (Team Members)

| ลำดับ | ชื่อ-นามสกุล | รหัสนิสิต | บทบาทหน้าที่หลัก |
| :---: | :--- | :---: | :--- |
| **1** | **ปริญญาธรณ์ นาคิน** | `6720210043` | • Authentication System (JWT & bcrypt)<br>• Smart Multi-tag Search (Fuse.js + Thai Dictionary)<br>• หน้าแรก/หน้ารายละเอียดหนัง (Hero Carousel, Cast, Trailer)<br>• ระบบสุ่มหนัง (Random Movie Picker)<br>• ระบบรายการโปรด (Watchlist & Favorites)<br>• Profile & Avatar Settings |
| **2** | **กิตติศักดิ์ นวลประจักร์** | `6720210100` | • ระบบรีวิวภาพยนตร์ (Review CRUD & Rating 1-5 ดาว)<br>• แนะนำช่องทางรับชมจริง (Where to Watch: TMDb Providers)<br>• ระบบแอดมิน (Admin Dashboard & Moderation Queue)<br>• ระบบตรวจสอบสิทธิ์ (RBAC, IDOR Prevention, Edit Request Approval)<br>• การดูแลเซิร์ฟเวอร์และการเขียนสคริปต์ Deployment อัตโนมัติ |

---

## 📄 8. เอกสารประกอบโครงงาน (Deliverables)
* 📑 **รายงานโครงงานฉบับสมบูรณ์ (Word / PDF):** อยู่ในไฟล์ `รายงานโครงงานฉบับสมบูรณ์_Doo_Arai_Dee.docx` (กรอกข้อมูลครบถ้วนทั้ง 11 ส่วน)
* 💻 **Live Application:** [https://dooaraidee.online/](https://dooaraidee.online/)

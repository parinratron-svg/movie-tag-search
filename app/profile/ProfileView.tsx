"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Heart,
  Clock,
  Bookmark,
  Settings,
  Camera,
  Image as ImageIcon,
  Edit3,
  Shield,
  Sparkles,
  Flame,
  Clapperboard,
  Sprout,
  Star,
  Check,
  X,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  Film,
  CheckCircle2,
} from "lucide-react";
import AvatarUploader from "./AvatarUploader";

interface MovieSummary {
  id: string;
  title: string;
  posterPath: string | null;
  genres: string[];
}

interface ActivityItem {
  id: string;
  type: "view" | "favorite" | "review" | "watchlist";
  title: string;
  subtitle: string;
  detail?: string;
  rating?: number;
  timeAgo: string;
  movie?: MovieSummary | null;
}

interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: "USER" | "ADMIN";
  };
  stats: {
    viewsCount: number;
    favoritesCount: number;
    watchlistCount: number;
    reviewsCount: number;
  };
  recentActivities: ActivityItem[];
  recentReviews: ActivityItem[];
  recentFavorites: ActivityItem[];
  genreStats: { label: string; count: number; percentage: number; color: string }[];
}

function getPosterUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/w200${path}`;
}

const PRESET_BANNERS = [
  {
    id: "anime-cozy",
    name: "Anime Room Cozy",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "cyberpunk-night",
    name: "Cyberpunk Neon Night",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "starry-galaxy",
    name: "Starry Galaxy Sky",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "ghibli-nature",
    name: "Ghibli Summer Nature",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "dark-cinema",
    name: "Cinematic Dark Violet",
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "anime-sunset",
    name: "Anime Sunset Scenery",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop",
  },
];

const MAX_BANNER_SIZE = 8 * 1024 * 1024; // 8MB

// =========================================================================
// IndexedDB Storage Helper (สำหรับเก็บไฟล์รูปภาพ & GIF ขนาดใหญ่โดยไม่ติด Quota)
// =========================================================================
const DB_NAME = "DooAraiDeeDB";
const STORE_NAME = "profile_assets";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("No IndexedDB"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveAssetToDB(key: string, value: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

async function loadAssetFromDB(key: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export default function ProfileView({
  user,
  stats,
  recentActivities,
  recentReviews,
  recentFavorites,
  genreStats,
}: ProfileViewProps) {
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerTab, setBannerTab] = useState<"preset" | "upload" | "url">("preset");
  const [customBannerInput, setCustomBannerInput] = useState("");
  const [activeTab, setActiveTab] = useState<"activity" | "reviews" | "favorites">("activity");
  
  // Custom Bio State
  const [bio, setBio] = useState('"ดูหนัง เล่นเกม ใช้ชีวิตไปวันๆ 🐱"');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio);

  // Toast / Error Notification State
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Banner & Bio from IndexedDB & LocalStorage
  useEffect(() => {
    async function loadData() {
      // 1. โหลด Banner จาก IndexedDB ก่อน
      const dbBanner = await loadAssetFromDB(`profile_banner_${user.id}`);
      if (dbBanner) {
        setBannerUrl(dbBanner);
      } else {
        // Fallback localStorage
        try {
          const saved = localStorage.getItem(`profile_banner_${user.id}`);
          if (saved) setBannerUrl(saved);
        } catch {}
      }

      // 2. โหลด Bio
      try {
        const savedBio = localStorage.getItem(`profile_bio_${user.id}`);
        if (savedBio) {
          setBio(savedBio);
          setBioInput(savedBio);
        }
      } catch {}
    }

    loadData();
  }, [user.id]);

  const handleSelectBanner = async (url: string) => {
    setBannerUrl(url);
    setIsBannerModalOpen(false);
    setModalError(null);
    showToast("✨ เปลี่ยนภาพพื้นหลังโปรไฟล์เรียบร้อยแล้ว!");

    // บันทึกเข้า IndexedDB (รองรับขนาดไฟล์ใหญ่/GIF ได้อย่างไม่จำกัด)
    await saveAssetToDB(`profile_banner_${user.id}`, url);

    // Fallback สำหรับ URL สั้นๆ (ป้องกัน QuotaExceededError)
    if (url.length < 500000) {
      try {
        localStorage.setItem(`profile_banner_${user.id}`, url);
      } catch {}
    }
  };

  const handleSaveCustomBanner = () => {
    if (!customBannerInput.trim()) return;
    handleSelectBanner(customBannerInput.trim());
    setCustomBannerInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalError(null);

    if (!file.type.startsWith("image/")) {
      setModalError("รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, GIF, WebP)");
      return;
    }

    if (file.size > MAX_BANNER_SIZE) {
      setModalError("ขนาดไฟล์ใหญ่เกินไป (กรุณาใช้ไฟล์ไม่เกิน 8MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleSelectBanner(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBio = () => {
    setBio(bioInput);
    try {
      localStorage.setItem(`profile_bio_${user.id}`, bioInput);
    } catch {}
    setIsEditingBio(false);
    showToast("💾 บันทึกสเตตัสเรียบร้อยแล้ว");
  };

  // Gamification Calculation
  const totalXp = stats.viewsCount * 15 + stats.favoritesCount * 20 + stats.reviewsCount * 30 + stats.watchlistCount * 5;
  const currentLevel = Math.max(1, Math.floor(totalXp / 150) + 1);
  const nextLevelXp = currentLevel * 150;
  const currentLevelProgress = totalXp % 150;
  const xpPercent = Math.min(100, Math.round((currentLevelProgress / 150) * 100));

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] selection:bg-[#E8A33D]/30 selection:text-[#E8A33D] pb-20 relative">
      
      {/* Sleek Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#121A1A]/95 px-5 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-xl animate-bounce duration-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HERO COVER BANNER                                                  */}
      {/* ========================================================================= */}
      <div className="relative h-72 sm:h-[340px] w-full overflow-hidden border-b border-white/10 bg-[#12141D]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-90"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
        {/* Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F]/70 via-transparent to-[#090A0F]/70" />

        {/* Floating Sparkles & Cute Caption */}
        <div className="absolute right-4 top-6 sm:right-12 sm:top-8 hidden md:flex flex-col items-end text-right z-20">
          <div className="rounded-2xl border border-white/15 bg-black/40 px-4 py-2 backdrop-blur-md shadow-xl shadow-purple-950/40 transform hover:scale-105 transition">
            <p className="font-serif text-sm font-medium tracking-wide text-white/90">
              ✦ ดูหนังดีๆ มีความสุขในทุกวัน <span className="text-[#E8A33D]">:3</span> ✦
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span>Profile Customization</span>
          </div>
        </div>

        {/* Change Banner Button (Positioned prominently and clearly) */}
        <button
          onClick={() => {
            setModalError(null);
            setIsBannerModalOpen(true);
          }}
          className="absolute right-4 bottom-14 sm:right-8 sm:bottom-16 z-20 flex items-center gap-2 rounded-full border border-white/25 bg-black/70 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          <ImageIcon className="h-3.5 w-3.5 text-[#E8A33D]" />
          <span>เปลี่ยนพื้นหลัง / GIF</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-COLUMN PROFILE LAYOUT                                           */}
      {/* ========================================================================= */}
      <div className="mx-auto -mt-8 sm:-mt-12 max-w-7xl px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* --------------------------------------------------------------------- */}
          {/* COLUMN 1: LEFT NAVIGATION & MASCOT (3 COLS)                          */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sidebar Navigation */}
            <div className="rounded-2xl border border-white/10 bg-[#121520]/90 p-3 shadow-xl backdrop-blur-xl space-y-1">
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-purple-800/20 px-4 py-3 text-sm font-semibold text-white shadow-inner border border-purple-500/30 transition"
              >
                <User className="h-4 w-4 text-purple-400" />
                <span>โปรไฟล์</span>
              </Link>

              <Link
                href="/profile/favorites"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span>รายการโปรด</span>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                  {stats.favoritesCount}
                </span>
              </Link>

              <Link
                href="/profile/history"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#E8A33D]" />
                  <span>ประวัติการดู</span>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                  {stats.viewsCount}
                </span>
              </Link>

              <Link
                href="/profile/watchlist"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="h-4 w-4 text-blue-400" />
                  <span>รายการที่อยากดู</span>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                  {stats.watchlistCount}
                </span>
              </Link>

              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => setIsBannerModalOpen(true)}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span>ตกแต่งโปรไฟล์</span>
                </button>
              </div>
            </div>

            {/* Anime Mascot Card on Bottom-Left */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1E1B2E]/90 to-[#121520]/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-purple-400/40 bg-purple-900/30 shadow-lg shadow-purple-500/20">
                  <Image
                    src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop"
                    alt="Mascot"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-400/30">
                    <Sparkles className="h-2.5 w-2.5" /> Mascot
                  </span>
                  <h4 className="mt-1 font-serif text-sm font-bold text-white">
                    ✦ ดูหนัง ให้สนุกนะ ✨
                  </h4>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/60">
                เลือกหนังที่ใช่ แล้วเพลิดเพลินไปกับทุกช่วงเวลาการรับชมของคุณ!
              </p>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* COLUMN 2: CENTER PROFILE CARD & TABS (5 COLS)                         */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-6">
            {/* Profile Overview Card */}
            <div className="rounded-3xl border border-white/10 bg-[#141722]/90 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                  <User className="h-3.5 w-3.5 text-[#E8A33D]" />
                  <span>โปรไฟล์ของฉัน</span>
                </div>

                <button
                  onClick={() => setIsEditingBio(!isEditingBio)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>แก้ไขข้อมูล</span>
                </button>
              </div>

              {/* Avatar & User Details */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative">
                  <AvatarUploader name={user.name} currentAvatarUrl={user.avatarUrl} />
                </div>

                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="font-serif text-xl font-bold text-white tracking-wide">
                      {user.name}
                    </h2>
                    {user.role === "ADMIN" ? (
                      <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        👑 ADMIN
                      </span>
                    ) : (
                      <span className="rounded-full bg-purple-500/20 border border-purple-400/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                        ⭐ USER
                      </span>
                    )}
                  </div>

                  {/* Bio Description */}
                  {isEditingBio ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={bioInput}
                        onChange={(e) => setBioInput(e.target.value)}
                        placeholder="พิมพ์สเตตัส หรือคำคมประจำตัว..."
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#E8A33D] focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveBio}
                          className="rounded-lg bg-[#E8A33D] px-2.5 py-1 text-xs font-semibold text-black hover:bg-[#f0b558]"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => setIsEditingBio(false)}
                          className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white/70 hover:bg-white/20"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-xs italic text-white/70 font-light">
                      {bio}
                    </p>
                  )}

                  {/* Email & Info */}
                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs text-white/50">
                    <span>✉️</span>
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tabs Header */}
            <div className="rounded-2xl border border-white/10 bg-[#121520]/80 p-1.5 shadow-xl backdrop-blur-md">
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                    activeTab === "activity"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>กิจกรรมล่าสุด</span>
                </button>

                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                    activeTab === "reviews"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Star className="h-3.5 w-3.5" />
                  <span>รีวิวของฉัน</span>
                </button>

                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                    activeTab === "favorites"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Heart className="h-3.5 w-3.5" />
                  <span>รายการที่ชอบ</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="space-y-3">
              {activeTab === "activity" && (
                recentActivities.length > 0 ? (
                  recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#141722]/80 p-3.5 shadow-lg backdrop-blur-md transition hover:border-white/20 hover:bg-[#1A1E2C]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                          {getPosterUrl(act.movie?.posterPath) ? (
                            <Image
                              src={getPosterUrl(act.movie?.posterPath)!}
                              alt={act.movie?.title || "Movie Poster"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                              🎬
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white group-hover:text-[#E8A33D] transition">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            {act.subtitle}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-white/40 shrink-0">
                        {act.timeAgo}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#141722]/60 p-8 text-center text-xs text-white/40">
                    ยังไม่มีกิจกรรมล่าสุด เริ่มดูหนังหรือรีวิวเรื่องที่ชอบได้เลย!
                  </div>
                )
              )}

              {activeTab === "reviews" && (
                recentReviews.length > 0 ? (
                  recentReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-white/10 bg-[#141722]/80 p-4 shadow-lg backdrop-blur-md space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">
                          {rev.title}
                        </h4>
                        <span className="text-xs font-bold text-[#E8A33D] flex items-center gap-1">
                          ★ {rev.rating}/10
                        </span>
                      </div>
                      <p className="text-xs text-white/70">
                        {rev.detail || rev.subtitle}
                      </p>
                      <p className="text-[10px] text-white/40">{rev.timeAgo}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#141722]/60 p-8 text-center text-xs text-white/40">
                    คุณยังไม่ได้เขียนรีวิวหนังเรื่องใดเลย
                  </div>
                )
              )}

              {activeTab === "favorites" && (
                recentFavorites.length > 0 ? (
                  recentFavorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#141722]/80 p-3.5 shadow-lg backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                          {getPosterUrl(fav.movie?.posterPath) ? (
                            <Image
                              src={getPosterUrl(fav.movie?.posterPath)!}
                              alt={fav.movie?.title || "Movie Poster"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                              ❤️
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{fav.title}</p>
                          <p className="text-[11px] text-white/50">{fav.subtitle}</p>
                        </div>
                      </div>
                      <Link
                        href={`/movies/${fav.movie?.id}`}
                        className="rounded-lg bg-white/10 p-2 text-white/60 hover:text-white hover:bg-white/20 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#141722]/60 p-8 text-center text-xs text-white/40">
                    ยังไม่มีหนังในรายการโปรด
                  </div>
                )
              )}
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* COLUMN 3: GAMIFICATION & STATS ANALYTICS (4 COLS)                    */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6">
            {/* Level & XP Card */}
            <div className="rounded-3xl border border-white/10 bg-[#141722]/90 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-600/30">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white">
                      เลเวล {currentLevel}
                    </h3>
                    <p className="text-[11px] text-purple-300">
                      {currentLevel >= 5 ? "ปรมาจารย์นักดูหนัง" : currentLevel >= 3 ? "นักดูหนังสายลุย" : "นักดูหนังมือใหม่"}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-white/60">
                  XP {currentLevelProgress} / 150
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-[#E8A33D] transition-all duration-1000 shadow-sm shadow-purple-400"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats Triple Grid */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                <div className="rounded-xl bg-white/5 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-white/50">
                    <Film className="h-3 w-3 text-blue-400" />
                    <span>ดูแล้ว</span>
                  </div>
                  <p className="mt-1 text-base font-bold text-white">{stats.viewsCount}</p>
                </div>

                <div className="rounded-xl bg-white/5 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-white/50">
                    <Heart className="h-3 w-3 text-red-400" />
                    <span>ถูกใจ</span>
                  </div>
                  <p className="mt-1 text-base font-bold text-white">{stats.favoritesCount}</p>
                </div>

                <div className="rounded-xl bg-white/5 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-white/50">
                    <Bookmark className="h-3 w-3 text-[#E8A33D]" />
                    <span>จัดเก็บ</span>
                  </div>
                  <p className="mt-1 text-base font-bold text-white">{stats.watchlistCount}</p>
                </div>
              </div>
            </div>

            {/* Badges / เหรียญตรา */}
            <div className="rounded-3xl border border-white/10 bg-[#141722]/90 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎖️</span>
                  <h4 className="font-serif text-sm font-bold text-white">เหรียญตรา</h4>
                </div>
                <button className="text-[11px] text-purple-400 hover:text-purple-300 transition">
                  ดูทั้งหมด &gt;
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-2.5 transition hover:scale-105">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-medium text-amber-200">นักดูตัวยง</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 p-2.5 transition hover:scale-105">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                    <Flame className="h-5 w-5 fill-purple-400 text-purple-400" />
                  </div>
                  <span className="text-[10px] font-medium text-purple-200">สายเมะ</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-2.5 transition hover:scale-105">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                    <Clapperboard className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-medium text-blue-200">นักรีวิว</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 transition hover:scale-105">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Sprout className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-medium text-emerald-200">สายชิล</span>
                </div>
              </div>
            </div>

            {/* Donut Chart / สถิติการดูหนัง */}
            <div className="rounded-3xl border border-white/10 bg-[#141722]/90 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                  <span>📊</span>
                  <span className="text-white font-serif font-bold text-sm">สถิติการดูหนัง</span>
                </div>
                <Link
                  href="/profile/history"
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition"
                >
                  ดูเพิ่มเติม &gt;
                </Link>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                {/* Visual Donut Chart Indicator */}
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-500"
                      strokeDasharray="60, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#E8A33D]"
                      strokeDasharray="25, 100"
                      strokeDashoffset="-60"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-base font-bold text-white">{stats.viewsCount}</span>
                    <span className="text-[9px] text-white/50">เรื่อง</span>
                  </div>
                </div>

                {/* Genre Legend */}
                <div className="flex-1 space-y-2">
                  {genreStats.map((g, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: g.color }}
                        />
                        <span className="text-white/70">{g.label}</span>
                      </div>
                      <span className="font-mono text-white/50">
                        {g.count} ({g.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inspirational Movie Quote Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E1B2E]/90 to-[#121520]/90 p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-purple-400 font-serif leading-none">“</span>
                <p className="text-xs leading-relaxed text-white/80 italic">
                  หนังดีๆ ไม่ได้แค่ทำให้เราสนุก แต่มันยังทำให้เราได้เจอโลกใหม่ๆ ในทุกๆ วัน
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-medium">
                  <span>🐱 Doo Arai Dee Community</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: CHANGE COVER BANNER (BACKGROUND) - PREMIUM REDESIGN              */}
      {/* ========================================================================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-[#121422] p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E8A33D] to-amber-500 text-black shadow-lg shadow-amber-500/20">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    ตกแต่งภาพพื้นหลังโปรไฟล์ (Cover Banner)
                  </h3>
                  <p className="text-xs text-white/50">
                    เลือกสไตล์ที่คุณชื่นชอบ หรืออัปโหลดภาพ/GIF ได้ตามใจ
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsBannerModalOpen(false);
                  setModalError(null);
                }}
                className="rounded-full bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* In-Modal Sleek Error Alert Box */}
            {modalError && (
              <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{modalError}</span>
                </div>
                <button
                  onClick={() => setModalError(null)}
                  className="rounded-full p-1 text-rose-400 hover:bg-rose-500/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Modal Tabs Navigation */}
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => {
                  setBannerTab("preset");
                  setModalError(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                  bannerTab === "preset"
                    ? "bg-[#E8A33D] text-black shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>ภาพสำเร็จรูป</span>
              </button>

              <button
                onClick={() => {
                  setBannerTab("upload");
                  setModalError(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                  bannerTab === "upload"
                    ? "bg-[#E8A33D] text-black shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>อัปโหลดจากเครื่อง</span>
              </button>

              <button
                onClick={() => {
                  setBannerTab("url");
                  setModalError(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                  bannerTab === "url"
                    ? "bg-[#E8A33D] text-black shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>วางลิงก์ URL</span>
              </button>
            </div>

            {/* Tab 1: Presets Grid */}
            {bannerTab === "preset" && (
              <div className="space-y-3">
                <p className="text-xs text-white/60">คลิกที่ภาพเพื่อตั้งค่าเป็นพื้นหลังทันที:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectBanner(preset.url)}
                      className={`group relative h-24 overflow-hidden rounded-2xl border transition-all duration-300 ${
                        bannerUrl === preset.url
                          ? "border-[#E8A33D] ring-2 ring-[#E8A33D]/60 scale-[1.02]"
                          : "border-white/10 hover:border-white/40 hover:scale-[1.02]"
                      }`}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[11px] font-bold text-white drop-shadow">
                        {preset.name}
                      </span>
                      {bannerUrl === preset.url && (
                        <div className="absolute top-2 right-2 rounded-full bg-[#E8A33D] p-1 text-black shadow-md">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Local File / GIF Upload */}
            {bannerTab === "upload" && (
              <div className="space-y-4">
                <label className="group flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center cursor-pointer transition-all duration-300 hover:border-[#E8A33D] hover:bg-[#E8A33D]/5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 group-hover:border-[#E8A33D]/40 group-hover:text-[#E8A33D] transition-all">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-[#E8A33D] transition">
                      คลิกเพื่อเลือกไฟล์รูปภาพ หรือ GIF
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      รองรับไฟล์ PNG, JPG, WebP และภาพเคลื่อนไหว GIF (สูงสุด 8MB)
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 group-hover:bg-[#E8A33D] group-hover:text-black transition">
                    Browse Files
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            )}

            {/* Tab 3: Custom URL Input */}
            {bannerTab === "url" && (
              <div className="space-y-4">
                <p className="text-xs text-white/60">
                  วางลิงก์รูปภาพ หรือไฟล์ GIF จากอินเทอร์เน็ต (Direct URL):
                </p>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... หรือ .gif"
                    value={customBannerInput}
                    onChange={(e) => setCustomBannerInput(e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/40 focus:border-[#E8A33D] focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
                  />
                  <button
                    onClick={handleSaveCustomBanner}
                    disabled={!customBannerInput.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#E8A33D] py-3 text-xs font-bold text-black transition hover:bg-[#f3b355] disabled:opacity-30"
                  >
                    <Check className="h-4 w-4" />
                    <span>ใช้รูปภาพนี้</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsBannerModalOpen(false);
                  setModalError(null);
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

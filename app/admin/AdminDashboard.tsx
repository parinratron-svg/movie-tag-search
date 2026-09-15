"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Film,
  Users,
  MessageSquare,
  Eye,
  Shield,
  Trash2,
  Plus,
  Star,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Check,
  X,
  History,
  Tag,
  Filter,
  Flame,
  MousePointerClick,
  Home,
  LogOut,
  LayoutDashboard,
  Bell,
  Search,
  Server,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

type MovieItem = {
  id: string;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  voteAverage: number | null;
  genres: string[];
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  createdAt: string;
  _count: { reviews: number; views: number };
};

type ReviewItem = {
  id: string;
  content: string;
  rating: number;
  pendingContent?: string | null;
  pendingRating?: number | null;
  editStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | null;
  editRequestedAt?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  movie: { id: string; title: string; posterPath: string | null };
};

type ViewRecord = {
  id: string;
  viewCount: number;
  viewedAt: string;
  movie: {
    id: string;
    title: string;
    posterPath: string | null;
    genres: string[];
    releaseYear: number | null;
    voteAverage: number | null;
  };
};

type CategorizedViews = Record<string, ViewRecord[]>;

type Stats = {
  totalMovies: number;
  totalUsers: number;
  totalReviews: number;
  totalViews: number;
  pendingEditRequestsCount: number;
};

export default function AdminDashboard({
  stats,
  users: initialUsers,
  reviews: initialReviews,
  movies: initialMovies,
  pendingReviews: initialPendingReviews,
  allViewsByUser: initialAllViewsByUser,
  providerStats = [],
  currentUserId,
}: {
  stats: Stats;
  users: UserItem[];
  reviews: ReviewItem[];
  movies: MovieItem[];
  pendingReviews: ReviewItem[];
  allViewsByUser: Record<string, ViewRecord[]>;
  providerStats?: Array<{ providerName: string; count: number }>;
  currentUserId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "requests" | "users" | "history" | "reviews" | "movies"
  >("overview");

  // Local States
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [pendingReviews, setPendingReviews] = useState<ReviewItem[]>(initialPendingReviews);
  const [movies, setMovies] = useState<MovieItem[]>(initialMovies);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    initialUsers[0]?.id || ""
  );
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New Movie Modal
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOverview, setNewOverview] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newGenres, setNewGenres] = useState("Action, Drama");
  const [newDirector, setNewDirector] = useState("");

  function showNotification(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  }

  // 1. Approve Review Edit Request
  async function handleApproveEdit(reviewId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("อนุมัติไม่สำเร็จ");

      setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === reviewId) {
            return {
              ...r,
              content: r.pendingContent || r.content,
              rating: r.pendingRating || r.rating,
              pendingContent: null,
              pendingRating: null,
              editStatus: "APPROVED",
            };
          }
          return r;
        })
      );

      showNotification("อนุมัติคำขอแก้ไขรีวิวเรียบร้อยแล้ว!");
    } catch (err) {
      showNotification("เกิดข้อผิดพลาดในการอนุมัติ", "error");
    } finally {
      setLoading(false);
    }
  }

  // 2. Reject Review Edit Request
  async function handleRejectEdit(reviewId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("ปฏิเสธไม่สำเร็จ");

      setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, pendingContent: null, pendingRating: null, editStatus: "REJECTED" }
            : r
        )
      );

      showNotification("ปฏิเสธคำขอแก้ไขเรียบร้อยแล้ว");
    } catch (err) {
      showNotification("เกิดข้อผิดพลาดในการปฏิเสธคำขอ", "error");
    } finally {
      setLoading(false);
    }
  }

  // 3. Toggle User Role
  async function handleToggleRole(userId: string, currentRole: "USER" | "ADMIN") {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) throw new Error("อัปเดตไม่สำเร็จ");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showNotification(`อัปเดตบทบาทเป็น ${newRole} เรียบร้อยแล้ว`);
    } catch (err) {
      showNotification("เกิดข้อผิดพลาดในการเปลี่ยนบทบาท", "error");
    } finally {
      setLoading(false);
    }
  }

  // 4. Delete User
  async function handleDeleteUser(userId: string) {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้? การลบนี้รวมถึงรีวิวและประวัติทั้งหมด")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ลบผู้ใช้ไม่สำเร็จ");
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setReviews((prev) => prev.filter((r) => r.user.id !== userId));
      setPendingReviews((prev) => prev.filter((r) => r.user.id !== userId));
      showNotification("ลบผู้ใช้เรียบร้อยแล้ว");
    } catch (err: any) {
      showNotification(err.message || "เกิดข้อผิดพลาด", "error");
    } finally {
      setLoading(false);
    }
  }

  // 5. Delete Review
  async function handleDeleteReview(reviewId: string) {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("ลบรีวิวไม่สำเร็จ");

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showNotification("ลบรีวิวเรียบร้อยแล้ว");
    } catch (err) {
      showNotification("เกิดข้อผิดพลาดในการลบรีวิว", "error");
    } finally {
      setLoading(false);
    }
  }

  // 6. Delete Movie
  async function handleDeleteMovie(movieId: string) {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบภาพยนตร์เรื่องนี้จากระบบ?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/movies?movieId=${movieId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("ลบภาพยนตร์ไม่สำเร็จ");

      setMovies((prev) => prev.filter((m) => m.id !== movieId));
      setReviews((prev) => prev.filter((r) => r.movie.id !== movieId));
      setPendingReviews((prev) => prev.filter((r) => r.movie.id !== movieId));
      showNotification("ลบภาพยนตร์เรียบร้อยแล้ว");
    } catch (err) {
      showNotification("เกิดข้อผิดพลาดในการลบภาพยนตร์", "error");
    } finally {
      setLoading(false);
    }
  }

  // 7. Add Movie
  async function handleAddMovie(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !newOverview) return;
    setLoading(true);

    try {
      const genresArray = newGenres.split(",").map((g) => g.trim()).filter(Boolean);

      const res = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          overview: newOverview,
          releaseYear: Number(newYear),
          genres: genresArray,
          director: newDirector || null,
        }),
      });

      if (!res.ok) throw new Error("เพิ่มภาพยนตร์ไม่สำเร็จ");

      const createdMovie = await res.json();
      setMovies((prev) => [createdMovie, ...prev]);
      setShowAddMovieModal(false);
      setNewTitle("");
      setNewOverview("");
      showNotification("เพิ่มภาพยนตร์ใหม่เรียบร้อยแล้ว");
    } catch (err) {
      showNotification("เกิดข้อผิดพลาดในการเพิ่มภาพยนตร์", "error");
    } finally {
      setLoading(false);
    }
  }

  // Logout
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // GLOBAL MOST CLICKED MOVIES CALCULATION
  const movieClickStatsMap = new Map<
    string,
    { movie: ViewRecord["movie"]; totalClicks: number; userSet: Set<string> }
  >();

  Object.entries(initialAllViewsByUser).forEach(([uId, userViews]) => {
    userViews.forEach((v) => {
      const mId = v.movie.id;
      if (!movieClickStatsMap.has(mId)) {
        movieClickStatsMap.set(mId, {
          movie: v.movie,
          totalClicks: 0,
          userSet: new Set(),
        });
      }
      const item = movieClickStatsMap.get(mId)!;
      item.totalClicks += v.viewCount || 1;
      item.userSet.add(uId);
    });
  });

  const mostClickedMovies = Array.from(movieClickStatsMap.values())
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 10);

  // USER CATEGORIZED VIEWS
  const selectedUserViews = initialAllViewsByUser[selectedUserId] || [];
  
  // Categorize views by Genre
  const categorizedViews: CategorizedViews = {};
  selectedUserViews.forEach((view) => {
    const genres = view.movie.genres.length > 0 ? view.movie.genres : ["ทั่วไป (General)"];
    genres.forEach((genre) => {
      if (!categorizedViews[genre]) categorizedViews[genre] = [];
      if (!categorizedViews[genre].some((v) => v.id === view.id)) {
        categorizedViews[genre].push(view);
      }
    });
  });

  const allGenresOfUser = Object.keys(categorizedViews).sort();

  const activeUser = users.find((u) => u.id === currentUserId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0C0F] text-[#F3F4F6] font-sans">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md ${
            message.type === "success"
              ? "bg-emerald-600/90 border border-emerald-400/30"
              : "bg-rose-600/90 border border-rose-400/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      {/* DISTINCT LEFT SIDEBAR - ADMIN PORTAL LAYOUT */}
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-slate-800/80 bg-[#0E1117] p-4 shadow-2xl select-none">
        <div>
          {/* Admin Logo Header */}
          <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20">
              <Shield className="h-5 w-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold tracking-tight text-white leading-none">
                ADMIN PORTAL
              </h1>
              <span className="text-[10px] font-semibold tracking-wider text-[#E8A33D] uppercase">
                Control Console
              </span>
            </div>
          </div>

          {/* Sidebar Menu Links */}
          <nav className="mt-6 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition ${
                activeTab === "overview"
                  ? "bg-[#E8A33D] text-[#0A0C0F] shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>ภาพรวมสถิติ</span>
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold transition ${
                activeTab === "requests"
                  ? "bg-[#E8A33D] text-[#0A0C0F] shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4" />
                <span>คำขอแก้ไขรีวิว</span>
              </div>
              {pendingReviews.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {pendingReviews.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition ${
                activeTab === "history"
                  ? "bg-[#E8A33D] text-[#0A0C0F] shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <History className="h-4 w-4" />
              <span>ประวัติการดู & สถิติคลิก</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition ${
                activeTab === "users"
                  ? "bg-[#E8A33D] text-[#0A0C0F] shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>จัดการผู้ใช้งาน</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition ${
                activeTab === "reviews"
                  ? "bg-[#E8A33D] text-[#0A0C0F] shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>รีวิวทั้งหมด</span>
            </button>

            <button
              onClick={() => setActiveTab("movies")}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition ${
                activeTab === "movies"
                  ? "bg-[#E8A33D] text-[#0A0C0F] shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Film className="h-4 w-4" />
              <span>จัดการคลังภาพยนตร์</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-slate-800/80 pt-4">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 px-3.5 py-2.5 text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition"
          >
            <Home className="h-4 w-4 text-[#E8A33D]" />
            <span>กลับสู่หน้าเว็บไซต์หลัก</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300 hover:bg-rose-500/20 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP BAR HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0E1117] px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Admin</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              {activeTab === "overview" && "ภาพรวมสถิติระบบ"}
              {activeTab === "requests" && "คำขอแก้ไขรีวิวรออนุมัติ"}
              {activeTab === "history" && "ประวัติการดู & สถิติจำนวนคลิก"}
              {activeTab === "users" && "จัดการผู้ใช้งานระบบ"}
              {activeTab === "reviews" && "จัดการรีวิวภาพยนตร์"}
              {activeTab === "movies" && "จัดการภาพยนตร์ในคลัง"}
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            {/* System Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400">
              <Server className="h-3.5 w-3.5" />
              <span>Neon PostgreSQL Connected</span>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-5">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-amber-500/20 border border-amber-500/40">
                {activeUser?.avatarUrl ? (
                  <Image src={activeUser.avatarUrl} alt={activeUser.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold text-[#E8A33D]">
                    A
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-none">
                  {activeUser?.name || "System Admin"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activeUser?.email || "admin@movietag.com"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#090B0E]">
          {/* TAB 1: OVERVIEW STATS */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">ภาพรวมระบบ (Analytics Summary)</h2>
                <p className="text-xs text-slate-400 mt-1">สรุปข้อมูลสถิติภาพรวมและการทำงานทั้งหมดในระบบ</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">คลังภาพยนตร์</span>
                    <Film className="h-5 w-5 text-[#E8A33D]" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-white">{stats.totalMovies}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">ผู้ใช้งาน</span>
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">รีวิวทั้งหมด</span>
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-white">{stats.totalReviews}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">คำขอแก้ไขค้างอยู่</span>
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#E8A33D]">
                    {stats.pendingEditRequestsCount}
                  </p>
                </div>
              </div>

              {/* Provider Click Analytics Card */}
              <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      <MousePointerClick className="h-5 w-5 text-[#E8A33D]" />
                      <span>สถิติจำนวนผู้ใช้กดลิงก์เปิดวาร์ปไปดูบนแพลตฟอร์มถูกลิขสิทธิ์</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      สรุปสถิติว่าผู้ใช้งานในเว็บกดลิงก์ออกไปดูหนังในช่องทางถูกลิขสิทธิ์ช่องทางใดมากที่สุด
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-[#E8A33D]">
                    {providerStats?.reduce((a, b) => a + b.count, 0) || 0} Clicks
                  </span>
                </div>

                {!providerStats || providerStats.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    ยังไม่มีข้อมูลการกดเปิดวาร์ปไปดูแพลตฟอร์มต่างๆ (เริ่มนับเมื่อผู้ใช้กดดูบน Netflix, Disney+ ฯลฯ)
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {providerStats.map((p) => {
                      const totalClicks = providerStats.reduce((a, b) => a + b.count, 0) || 1;
                      const percent = Math.round((p.count / totalClicks) * 100);

                      let color = "bg-amber-500 text-amber-400 border-amber-500/30";
                      if (p.providerName.includes("Netflix")) color = "bg-red-600 text-red-400 border-red-500/30";
                      if (p.providerName.includes("Disney")) color = "bg-blue-600 text-blue-300 border-blue-500/30";
                      if (p.providerName.includes("Prime")) color = "bg-sky-500 text-sky-300 border-sky-400/30";
                      if (p.providerName.includes("HBO")) color = "bg-purple-600 text-purple-300 border-purple-500/30";
                      if (p.providerName.includes("Viu")) color = "bg-yellow-500 text-yellow-300 border-yellow-400/30";
                      if (p.providerName.includes("TrueID")) color = "bg-rose-600 text-rose-300 border-rose-500/30";

                      return (
                        <div
                          key={p.providerName}
                          className="rounded-xl border border-slate-800 bg-[#090B0E] p-4 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{p.providerName}</span>
                            <span className="text-xs font-semibold text-slate-400">{p.count} ครั้ง ({percent}%)</span>
                          </div>
                          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full transition-all duration-500 ${color.split(" ")[0]}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PENDING EDIT REQUESTS */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  คำขอแก้ไขรีวิวที่รอการอนุมัติ ({pendingReviews.length})
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  เมื่อผู้ใช้ทั่วไปขอแก้ไขรีวิว ข้อความเดิมจะยังคงแสดงในระบบ จนกว่าแอดมินจะกดอนุมัติ
                </p>
              </div>

              {pendingReviews.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-12 text-center text-slate-500">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400/60 mb-2" />
                  ไม่มีคำขอแก้ไขรีวิวที่ค้างอยู่
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-amber-500/30 bg-[#0E1117] p-6 shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-800">
                            {review.user.avatarUrl ? (
                              <Image
                                src={review.user.avatarUrl}
                                alt={review.user.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
                                {review.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-white">{review.user.name}</p>
                            <p className="text-xs text-slate-400">{review.user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">ภาพยนตร์:</span>
                          <Link
                            href={`/movies/${review.movie.id}`}
                            className="text-xs font-semibold text-[#E8A33D] hover:underline flex items-center gap-1"
                          >
                            {review.movie.title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Comparison Box */}
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {/* Original Review */}
                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                            📌 ข้อความเดิมปัจจุบัน
                          </span>
                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "fill-[#E8A33D] text-[#E8A33D]"
                                    : "text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-4">{review.content}</p>
                        </div>

                        {/* Pending Request */}
                        <div className="rounded-xl border border-[#E8A33D]/40 bg-[#E8A33D]/10 p-4">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8A33D] block mb-1">
                            ✨ ข้อความใหม่ที่ผู้ใช้ขอเปลี่ยน (รออนุมัติ)
                          </span>
                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < (review.pendingRating || review.rating)
                                    ? "fill-[#E8A33D] text-[#E8A33D]"
                                    : "text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs font-medium text-white line-clamp-4">
                            {review.pendingContent}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex justify-end gap-3 border-t border-slate-800/80 pt-4">
                        <button
                          onClick={() => handleRejectEdit(review.id)}
                          disabled={loading}
                          className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-40"
                        >
                          <X className="h-4 w-4" />
                          ปฏิเสธคำขอ
                        </button>

                        <button
                          onClick={() => handleApproveEdit(review.id)}
                          disabled={loading}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 shadow-lg shadow-emerald-950/50"
                        >
                          <Check className="h-4 w-4" />
                          อนุมัติการแก้ไข
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USER VIEW HISTORY & CLICK ANALYTICS */}
          {activeTab === "history" && (
            <div className="space-y-10">
              {/* SECTION A: MOST CLICKED MOVIES STATS */}
              <div className="rounded-2xl border border-[#E8A33D]/30 bg-[#0E1117] p-6 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8A33D]">
                  <Flame className="h-5 w-5 text-amber-500" />
                  อันดับภาพยนตร์ที่ถูกผู้ใช้คลิกดูมากที่สุด (Most Clicked Movies)
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  เมื่อผู้ใช้หลายๆ คนคลิกดูหนังเรื่องเดียวกัน ระบบจะสรุปจำนวนคลิกรวมแยกตามหมวดหมู่ไว้อย่างชัดเจน
                </p>

                {mostClickedMovies.length === 0 ? (
                  <p className="text-xs text-slate-500 mt-4">ยังไม่มีข้อมูลการคลิกชมภาพยนตร์</p>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {mostClickedMovies.map((item, idx) => (
                      <div
                        key={item.movie.id}
                        className="relative rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex flex-col justify-between"
                      >
                        <span className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#E8A33D] text-[11px] font-bold text-[#0F1115] shadow-md">
                          #{idx + 1}
                        </span>

                        <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-slate-900">
                          {item.movie.posterPath ? (
                            <Image
                              src={
                                item.movie.posterPath.startsWith("http")
                                  ? item.movie.posterPath
                                  : `https://image.tmdb.org/t/p/w200${item.movie.posterPath}`
                              }
                              alt={item.movie.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center p-1 text-center text-xs text-slate-500">
                              {item.movie.title}
                            </div>
                          )}
                        </div>

                        <div className="mt-2">
                          <p className="font-semibold text-xs text-white truncate">
                            {item.movie.title}
                          </p>

                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 font-bold text-[#E8A33D]">
                              <MousePointerClick className="h-3 w-3" />
                              {item.totalClicks} คลิก
                            </span>
                            <span className="text-slate-500">
                              ({item.userSet.size} คน)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: USER SPECIFIC CATEGORIZED VIEWS */}
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-white">
                    ประวัติการชมเจาะจงรายผู้ใช้ (แยกตามประเภทหมวดหมู่)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    เลือกผู้ใช้จากรายการเพื่อดูสถิติว่าผู้ใช้คนนั้นคลิกดูหนังเรื่องอะไรและหมวดไหนไปบ้าง
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                  {/* Sidebar User Selector */}
                  <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-4 space-y-2 max-h-[600px] overflow-y-auto">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 block mb-2">
                      เลือกผู้ใช้งาน
                    </span>
                    {users.map((u) => {
                      const isSelected = u.id === selectedUserId;
                      const viewCount = (initialAllViewsByUser[u.id] || []).reduce(
                        (acc, v) => acc + (v.viewCount || 1),
                        0
                      );
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setSelectedGenreFilter("ALL");
                          }}
                          className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                            isSelected
                              ? "bg-[#E8A33D] text-[#0F1115] font-semibold shadow-lg"
                              : "text-slate-300 hover:bg-slate-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div
                              className={`relative h-7 w-7 shrink-0 overflow-hidden rounded-full ${
                                isSelected ? "bg-[#0F1115]/20" : "bg-slate-800"
                              }`}
                            >
                              {u.avatarUrl ? (
                                <Image
                                  src={u.avatarUrl}
                                  alt={u.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs font-bold">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="truncate">
                              <p className="text-xs leading-tight truncate">{u.name}</p>
                              <p
                                className={`text-[10px] truncate ${
                                  isSelected ? "text-[#0F1115]/70" : "text-slate-400"
                                }`}
                              >
                                {u.email}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isSelected
                                ? "bg-[#0F1115] text-[#E8A33D]"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {viewCount} คลิก
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Main Categorized Display */}
                  <div className="space-y-6">
                    {/* Filter by genre bar */}
                    {allGenresOfUser.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
                        <Filter className="h-4 w-4 text-[#E8A33D] shrink-0" />
                        <span className="text-xs text-slate-400 shrink-0">กรองตามหมวดหมู่:</span>
                        <button
                          onClick={() => setSelectedGenreFilter("ALL")}
                          className={`rounded-full px-3 py-1 text-xs transition ${
                            selectedGenreFilter === "ALL"
                              ? "bg-[#E8A33D] text-[#0F1115] font-semibold"
                              : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          ทั้งหมด ({selectedUserViews.length})
                        </button>

                        {allGenresOfUser.map((genre) => (
                          <button
                            key={genre}
                            onClick={() => setSelectedGenreFilter(genre)}
                            className={`rounded-full px-3 py-1 text-xs transition whitespace-nowrap ${
                              selectedGenreFilter === genre
                                ? "bg-[#E8A33D] text-[#0F1115] font-semibold"
                                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            {genre} ({categorizedViews[genre].length})
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedUserViews.length === 0 ? (
                      <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-10 text-center text-slate-500">
                        ผู้ใช้นี้ยังไม่มีประวัติการคลิกดูหนังในระบบ
                      </div>
                    ) : (
                      allGenresOfUser
                        .filter(
                          (genre) =>
                            selectedGenreFilter === "ALL" || selectedGenreFilter === genre
                        )
                        .map((genre) => (
                          <div
                            key={genre}
                            className="rounded-2xl border border-slate-800 bg-[#0E1117] p-5 space-y-4 shadow-xl"
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <h3 className="font-serif text-base font-bold text-[#E8A33D] flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                หมวดหมู่ประเภท: {genre}
                              </h3>
                              <span className="text-xs text-slate-400">
                                {categorizedViews[genre].length} เรื่อง
                              </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                              {categorizedViews[genre].map((record) => (
                                <div
                                  key={record.id}
                                  className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-slate-700 transition"
                                >
                                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                                    {record.movie.posterPath ? (
                                      <Image
                                        src={
                                          record.movie.posterPath.startsWith("http")
                                            ? record.movie.posterPath
                                            : `https://image.tmdb.org/t/p/w200${record.movie.posterPath}`
                                        }
                                        alt={record.movie.title}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center p-1 text-[10px] text-slate-500">
                                        {record.movie.title}
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <Link
                                      href={`/movies/${record.movie.id}`}
                                      className="font-semibold text-xs text-white hover:text-[#E8A33D] truncate block"
                                    >
                                      {record.movie.title}
                                    </Link>
                                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                                      <span>{record.movie.releaseYear || "-"}</span>
                                      <span className="text-[#E8A33D] font-bold">
                                        {record.viewCount || 1} คลิก
                                      </span>
                                    </div>
                                    <p className="mt-1 text-[10px] text-slate-500">
                                      ล่าสุดเมื่อ: {new Date(record.viewedAt).toLocaleDateString("th-TH")}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USERS MANAGEMENT */}
          {activeTab === "users" && (
            <div className="rounded-2xl border border-slate-800 bg-[#0E1117] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">ผู้ใช้งาน</th>
                      <th className="px-6 py-4">อีเมล</th>
                      <th className="px-6 py-4">สถานะ (Role)</th>
                      <th className="px-6 py-4">ประวัติการดู</th>
                      <th className="px-6 py-4 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-900/40 transition">
                        <td className="px-6 py-4 font-semibold flex items-center gap-3 text-white">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-800">
                            {user.avatarUrl ? (
                              <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span>{user.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              user.role === "ADMIN"
                                ? "bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {user.role === "ADMIN" ? (
                              <>
                                <Shield className="h-3 w-3" /> ADMIN
                              </>
                            ) : (
                              "USER"
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{user._count.views} เรื่อง</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={user.id === currentUserId || loading}
                            className="rounded-lg border border-slate-700 px-3 py-1 text-[11px] font-medium hover:border-[#E8A33D] hover:text-[#E8A33D] disabled:opacity-40 transition"
                          >
                            สลับเป็น {user.role === "ADMIN" ? "USER" : "ADMIN"}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUserId || loading}
                            className="rounded-lg bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 transition"
                            title="ลบผู้ใช้"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ALL REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-[#0E1117] p-10 text-center text-slate-500">
                  ยังไม่มีรีวิวในระบบ
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0E1117] p-5 sm:flex-row sm:items-center sm:justify-between shadow-xl"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-white">{review.user.name}</span>
                        <span className="text-xs text-slate-400">รีวิวเรื่อง:</span>
                        <Link
                          href={`/movies/${review.movie.id}`}
                          className="text-xs text-[#E8A33D] font-semibold hover:underline flex items-center gap-1"
                        >
                          {review.movie.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="flex gap-0.5 my-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating ? "fill-[#E8A33D] text-[#E8A33D]" : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-slate-300">{review.content}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={loading}
                      className="self-end sm:self-center flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      ลบรีวิวนี้
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: MOVIES */}
          {activeTab === "movies" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-white">รายการภาพยนตร์ ({movies.length})</h2>
                <button
                  onClick={() => setShowAddMovieModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#E8A33D] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#f0b558] shadow-lg shadow-amber-500/10"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มหนังใหม่
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {movies.map((movie) => (
                  <div key={movie.id} className="relative group rounded-xl border border-slate-800 bg-[#0E1117] p-3 overflow-hidden shadow-xl">
                    <div className="relative aspect-2/3 w-full rounded-lg overflow-hidden bg-slate-950">
                      {movie.posterPath ? (
                        <Image
                          src={
                            movie.posterPath.startsWith("http")
                              ? movie.posterPath
                              : `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                          }
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-2 text-center text-xs text-slate-500">
                          {movie.title}
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="absolute top-2 right-2 rounded-lg bg-rose-600/90 p-2 text-white opacity-0 group-hover:opacity-100 transition shadow-lg"
                        title="ลบหนังเรื่องนี้"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <p className="font-semibold text-xs truncate text-white">{movie.title}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{movie.releaseYear ?? "-"}</span>
                        {movie.voteAverage != null && (
                          <span className="flex items-center gap-1 text-[#E8A33D]">
                            ★ {movie.voteAverage.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD MOVIE MODAL */}
          {showAddMovieModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0E1117] p-6 shadow-2xl">
                <h3 className="font-serif text-xl font-bold text-white">เพิ่มภาพยนตร์ใหม่</h3>

                <form onSubmit={handleAddMovie} className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">ชื่อภาพยนตร์ *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-[#E8A33D]"
                      placeholder="เช่น Avatar 3"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">เรื่องย่อ *</label>
                    <textarea
                      required
                      rows={3}
                      value={newOverview}
                      onChange={(e) => setNewOverview(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-[#E8A33D]"
                      placeholder="เรื่องย่อโดยสรุป..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">ปีที่ฉาย</label>
                      <input
                        type="number"
                        value={newYear}
                        onChange={(e) => setNewYear(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-[#E8A33D]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">ผู้กำกับ</label>
                      <input
                        type="text"
                        value={newDirector}
                        onChange={(e) => setNewDirector(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-[#E8A33D]"
                        placeholder="เช่น James Cameron"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">หมวดหมู่ (คั่นด้วยจุลภาค ,)</label>
                    <input
                      type="text"
                      value={newGenres}
                      onChange={(e) => setNewGenres(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white outline-none focus:border-[#E8A33D]"
                      placeholder="Action, Sci-Fi, Adventure"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMovieModal(false)}
                      className="rounded-xl border border-slate-800 px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-[#E8A33D] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#f0b558] disabled:opacity-50"
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

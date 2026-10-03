"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Film,
  Search,
  Plus,
  X,
  Sparkles,
  Flame,
  Check,
  Clapperboard,
  Clock,
  ChevronRight,
  Smile,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
}

interface Movie {
  id: string;
  title: string;
  posterPath: string | null;
  genres: string[];
  releaseYear: number | null;
  voteAverage: number | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  user: User;
  movie: Movie | null;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
}

interface TrendingPost {
  id: string;
  title: string;
  movie: { id: string; title: string; posterPath: string | null } | null;
  likesCount: number;
  commentsCount: number;
}

function formatThaiTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return "เมื่อสักครู่";
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return `เมื่อวานนี้ เวลา ${date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    })} น.`;
  }

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " น.";
}

export default function CommunityFeed({
  initialPosts,
  initialTrending,
  currentUser,
}: {
  initialPosts: Post[];
  initialTrending: TrendingPost[];
  currentUser: User | null;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [trending] = useState<TrendingPost[]>(initialTrending);
  const [activeTab, setActiveTab] = useState<"all" | "trending">("all");

  // Modal สร้างโพสต์
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [tagsInput, setTagsInput] = useState("โซเชียลเบต้า, อนิเมะ, แนะนำหนัง");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ค้นหาหนังสำหรับ Modal
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [movieSearchResults, setMovieSearchResults] = useState<Movie[]>([]);
  const [isSearchingMovie, setIsSearchingMovie] = useState(false);
  const [showMovieDropdown, setShowMovieDropdown] = useState(false);

  // เก็บ state คอมเมนต์ของแต่ละโพสต์
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    [initialPosts[0]?.id || ""]: true, // เปิดคอมเมนต์โพสต์แรกไว้เป็นตัวอย่าง
  });
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ค้นหาหนัง Realtime เมื่อพิมพ์
  useEffect(() => {
    if (!showMovieDropdown) return;
    const timer = setTimeout(async () => {
      setIsSearchingMovie(true);
      try {
        const res = await fetch(`/api/community/movies/search?q=${encodeURIComponent(movieSearchQuery)}`);
        const data = await res.json();
        setMovieSearchResults(data.movies || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingMovie(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [movieSearchQuery, showMovieDropdown]);

  // โหลดคอมเมนต์
  const loadComments = async (postId: string) => {
    if (commentsMap[postId]) return;
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      const data = await res.json();
      setCommentsMap((prev) => ({ ...prev, [postId]: data.comments || [] }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const nextState = !prev[postId];
      if (nextState) loadComments(postId);
      return { ...prev, [postId]: nextState };
    });
  };

  // กดถูกใจโพสต์
  const handleLike = async (postId: string) => {
    if (!currentUser) {
      showToast("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked: nextLiked,
            likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );

    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการกดถูกใจ");
    }
  };

  // ส่งคอมเมนต์
  const handleAddComment = async (postId: string) => {
    if (!currentUser) {
      showToast("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment],
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
          )
        );
      } else {
        showToast(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการส่งความคิดเห็น");
    }
  };

  // สร้างโพสต์ใหม่
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("กรุณาเข้าสู่ระบบก่อนสร้างโพสต์");
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      showToast("กรุณากรอกหัวข้อและเนื้อหาโพสต์");
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          movieId: selectedMovie?.id,
          tags,
        }),
      });

      const data = await res.json();
      if (res.ok && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        setIsModalOpen(false);
        setPostTitle("");
        setPostContent("");
        setSelectedMovie(null);
        showToast("🎉 โพสต์ของคุณถูกเผยแพร่แล้ว!");
      } else {
        showToast(data.error || "สร้างโพสต์ไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการสร้างโพสต์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F5F1E8] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#E8A33D]/40 bg-[#161922] px-4 py-3 text-sm text-[#F5F1E8] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="h-4 w-4 text-[#E8A33D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-[#181B24] to-[#0F1117] px-4 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-3 py-1 text-xs font-medium text-[#E8A33D]">
              <span>👥</span>
              <span>โซเชียลเบต้า (Community Feed)</span>
            </div>
            <h1 className="mt-2 font-serif text-2xl sm:text-3xl text-white">
              คอมมูนิตี้คนรักหนัง & อนิเมะ
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-white/60">
              โพสต์แนะนำหนัง แลกเปลี่ยนฉากประทับใจ หรือพูดคุยความรู้สึกหลังดูจบกับเพื่อนๆ
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) {
                showToast("กรุณาเข้าสู่ระบบก่อนสร้างโพสต์");
                return;
              }
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full border border-[#E8A33D] bg-[#E8A33D] px-5 py-2.5 text-sm font-semibold text-[#0B0D11] shadow-lg shadow-[#E8A33D]/20 transition hover:bg-[#f3b355] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>สร้างโพสต์ใหม่</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Feed Column (Left / Center) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Post Trigger Bar */}
            <div className="rounded-2xl border border-white/10 bg-[#141720]/80 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#E8A33D]/10">
                  {currentUser?.avatarUrl ? (
                    <Image
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-[#E8A33D]">
                      {currentUser?.name ? currentUser.name[0].toUpperCase() : "👤"}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      showToast("กรุณาเข้าสู่ระบบก่อนสร้างโพสต์");
                      return;
                    }
                    setIsModalOpen(true);
                  }}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-left text-xs sm:text-sm text-white/50 transition hover:border-white/20 hover:bg-white/10"
                >
                  คุณกำลังคิดอะไรอยู่? เลือกหนังและแชร์ความเห็นให้เพื่อนๆ ฟังกัน...
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-[#E8A33D] transition hover:border-[#E8A33D]/50 hover:bg-[#E8A33D]/10"
                >
                  <Film className="h-3.5 w-3.5" />
                  <span>เลือกหนัง</span>
                </button>
              </div>
            </div>

            {/* Posts Feed List */}
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#141720]/40 p-12 text-center">
                <Clapperboard className="mx-auto h-12 w-12 text-white/20" />
                <h3 className="mt-4 font-serif text-lg text-white/80">ยังไม่มีโพสต์ในขณะนี้</h3>
                <p className="mt-1 text-sm text-white/40">มาร่วมเป็นคนแรกที่โพสต์แนะนำหนังกันครับ!</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-5 rounded-full bg-[#E8A33D] px-5 py-2 text-xs font-semibold text-[#0B0D11] hover:bg-[#f0b558]"
                >
                  เขียนโพสต์แรก
                </button>
              </div>
            ) : (
              posts.map((post) => {
                const isCommentsOpen = !!expandedComments[post.id];
                const postComments = commentsMap[post.id] || [];
                const isAuthor = currentUser?.id === post.user.id;

                return (
                  <article
                    key={post.id}
                    id={`post-${post.id}`}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#141720]/90 shadow-xl backdrop-blur-md transition-all hover:border-white/15"
                  >
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between p-5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#E8A33D]/10">
                          {post.user.avatarUrl ? (
                            <Image
                              src={post.user.avatarUrl}
                              alt={post.user.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-[#E8A33D]">
                              {post.user.name[0].toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm sm:text-base">
                              {post.user.name}
                            </span>
                            {post.user.role === "ADMIN" && (
                              <span className="rounded bg-[#E8A33D]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#E8A33D] border border-[#E8A33D]/30">
                                ADMIN
                              </span>
                            )}
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                              👥 โซเชียลเบต้า
                            </span>
                          </div>
                          <p className="text-[11px] text-white/40">{formatThaiTime(post.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-5 pt-1 pb-3">
                      <h2 className="font-serif text-base sm:text-lg font-bold text-[#F5F1E8] leading-snug">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-xs sm:text-sm text-white/80 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Movie Tagged Banner (ดึงรูปและชื่อหนังอัตโนมัติ) */}
                    {post.movie && (
                      <div className="px-5 py-2">
                        <Link
                          href={`/movies/${post.movie.id}`}
                          className="group relative flex overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-black/80 via-[#181B24] to-[#12141A] transition hover:border-[#E8A33D]/60 hover:shadow-lg hover:shadow-[#E8A33D]/5"
                        >
                          {/* Poster / Backdrop */}
                          <div className="relative h-28 w-24 sm:h-36 sm:w-28 shrink-0 overflow-hidden bg-white/5">
                            {post.movie.posterPath ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w500${post.movie.posterPath}`}
                                alt={post.movie.title}
                                fill
                                sizes="120px"
                                className="object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                                {post.movie.title}
                              </div>
                            )}
                          </div>

                          {/* Movie Details in Card */}
                          <div className="flex flex-1 flex-col justify-center p-3.5 sm:p-5">
                            <div className="flex items-center gap-2 text-[11px] text-[#E8A33D]">
                              <Film className="h-3.5 w-3.5" />
                              <span>ภาพยนตร์ที่แท็กในโพสต์</span>
                            </div>
                            <h4 className="mt-1 font-serif text-sm sm:text-base font-bold text-white transition group-hover:text-[#E8A33D]">
                              {post.movie.title}
                            </h4>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
                              {post.movie.releaseYear && <span>ปี {post.movie.releaseYear}</span>}
                              {post.movie.voteAverage != null && (
                                <span>★ {post.movie.voteAverage.toFixed(1)}</span>
                              )}
                              {post.movie.genres?.slice(0, 2).map((g) => (
                                <span key={g} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mr-3 flex items-center text-white/30 transition group-hover:translate-x-1 group-hover:text-[#E8A33D]">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </Link>
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-5 py-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-[#E8A33D]/90 border border-white/5 transition hover:bg-[#E8A33D]/10 hover:border-[#E8A33D]/30 cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reaction Stats & Action Buttons */}
                    <div className="mx-5 my-2 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                          <span>{post.likesCount}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5 text-white/60" />
                          <span>{post.commentsCount} ความคิดเห็น</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Bar (Like, Comment, Share) */}
                    <div className="grid grid-cols-3 gap-1 border-t border-white/10 px-3 py-1.5 text-xs text-white/70">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center justify-center gap-2 rounded-lg py-2 transition hover:bg-white/5 ${
                          post.hasLiked ? "text-red-400 font-semibold" : "hover:text-white"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            post.hasLiked ? "fill-red-500 text-red-500 animate-pulse" : ""
                          }`}
                        />
                        <span>{post.hasLiked ? "ถูกใจแล้ว" : "ถูกใจ"}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center justify-center gap-2 rounded-lg py-2 transition hover:bg-white/5 hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>แสดงความคิดเห็น</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          showToast("คัดลอกลิงก์โพสต์เรียบร้อยแล้ว!");
                        }}
                        className="flex items-center justify-center gap-2 rounded-lg py-2 transition hover:bg-white/5 hover:text-white"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>แชร์</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {isCommentsOpen && (
                      <div className="border-t border-white/10 bg-black/20 p-5 space-y-4">
                        {/* Input Box */}
                        <div className="flex items-start gap-3">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#E8A33D]/10">
                            {currentUser?.avatarUrl ? (
                              <Image
                                src={currentUser.avatarUrl}
                                alt={currentUser.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#E8A33D]">
                                {currentUser?.name ? currentUser.name[0].toUpperCase() : "👤"}
                              </div>
                            )}
                          </div>

                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddComment(post.id);
                              }}
                              placeholder={
                                currentUser
                                  ? "เขียนความคิดเห็นของคุณ..."
                                  : "เข้าสู่ระบบเพื่อแสดงความคิดเห็น..."
                              }
                              disabled={!currentUser}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#E8A33D] focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!currentUser || !commentInputs[post.id]?.trim()}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#E8A33D] p-1.5 text-[#0B0D11] transition hover:bg-[#f0b558] disabled:opacity-30"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Comments List */}
                        {loadingComments[post.id] ? (
                          <p className="text-center text-xs text-white/40 py-2">กำลังโหลดความคิดเห็น...</p>
                        ) : postComments.length === 0 ? (
                          <p className="text-center text-xs text-white/30 py-2">ยังไม่มีความคิดเห็น มาร่วมเป็นคนแรกที่ตอบกลับ!</p>
                        ) : (
                          <div className="space-y-3 pt-2">
                            {postComments.map((c) => {
                              const isCommentAuthor = c.user.id === post.user.id;
                              return (
                                <div key={c.id} className="flex items-start gap-2.5">
                                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                                    {c.user.avatarUrl ? (
                                      <Image
                                        src={c.user.avatarUrl}
                                        alt={c.user.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-[10px] text-white/60">
                                        {c.user.name[0].toUpperCase()}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 rounded-xl border border-white/5 bg-white/5 p-3 text-xs">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-white/90">
                                          {c.user.name}
                                        </span>
                                        {isCommentAuthor && (
                                          <span className="rounded bg-[#E8A33D]/20 px-1 py-0.2 text-[9px] font-medium text-[#E8A33D] border border-[#E8A33D]/30">
                                            เจ้าของโพสต์
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-white/30">
                                        {formatThaiTime(c.createdAt)}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-white/80 whitespace-pre-line leading-relaxed">
                                      {c.content}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* Right Sidebar Column: Trending Posts */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 rounded-2xl border border-white/10 bg-[#141720]/90 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-semibold text-[#E8A33D]">
                <Flame className="h-4 w-4" />
                <span>โพสต์ยอดนิยมใน โซเชียลเบต้า</span>
              </div>

              <div className="mt-4 space-y-3">
                {trending.length === 0 ? (
                  <p className="text-xs text-white/40">ยังไม่มีโพสต์ยอดนิยม</p>
                ) : (
                  trending.map((t, index) => (
                    <a
                      key={t.id}
                      href={`#post-${t.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-2.5 transition hover:border-[#E8A33D]/40 hover:bg-white/10"
                    >
                      {/* Movie Thumbnail */}
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-white/5">
                        {t.movie?.posterPath ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${t.movie.posterPath}`}
                            alt={t.title}
                            fill
                            sizes="50px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-white/30">
                            #{index + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-xs font-medium text-white transition group-hover:text-[#E8A33D]">
                          {t.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-[10px] text-white/40">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-400" />
                            <span>{t.likesCount}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{t.commentsCount}</span>
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-[#E8A33D]" />
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: สร้างโพสต์ใหม่ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#161922] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8A33D]/20 text-[#E8A33D] text-xs">
                  ✍️
                </span>
                <h3 className="font-serif text-lg font-bold text-white">สร้างโพสต์ใหม่</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
              {/* Movie Picker Section */}
              <div>
                <label className="block text-xs font-semibold text-white/80">
                  🎬 หนังหรืออนิเมะที่ต้องการพูดถึง (ระบบจะดึงรูปและชื่อให้อัตโนมัติ):
                </label>

                {selectedMovie ? (
                  <div className="mt-2 flex items-center justify-between rounded-xl border border-[#E8A33D]/40 bg-[#E8A33D]/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-white/5">
                        {selectedMovie.posterPath && (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${selectedMovie.posterPath}`}
                            alt={selectedMovie.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-xs sm:text-sm text-white">{selectedMovie.title}</p>
                        <p className="text-[11px] text-[#E8A33D]">{selectedMovie.genres.join(", ")}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMovie(null)}
                      className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative mt-2">
                    <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                      <Search className="mr-2 h-4 w-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="พิมพ์ชื่อหนังเพื่อค้นหา..."
                        value={movieSearchQuery}
                        onFocus={() => setShowMovieDropdown(true)}
                        onChange={(e) => {
                          setMovieSearchQuery(e.target.value);
                          setShowMovieDropdown(true);
                        }}
                        className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none"
                      />
                    </div>

                    {showMovieDropdown && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-white/15 bg-[#1F232E] p-1.5 shadow-2xl">
                        {isSearchingMovie ? (
                          <p className="p-3 text-center text-xs text-white/40">กำลังค้นหาภาพยนตร์...</p>
                        ) : movieSearchResults.length === 0 ? (
                          <p className="p-3 text-center text-xs text-white/40">ไม่พบภาพยนตร์</p>
                        ) : (
                          movieSearchResults.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedMovie(m);
                                setShowMovieDropdown(false);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-xs text-white transition hover:bg-white/10"
                            >
                              <div className="relative h-9 w-7 shrink-0 overflow-hidden rounded bg-white/5">
                                {m.posterPath && (
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w200${m.posterPath}`}
                                    alt={m.title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 truncate">
                                <p className="font-semibold truncate">{m.title}</p>
                                <p className="text-[10px] text-white/40">{m.genres.slice(0, 2).join(", ")}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-white/80">
                  หัวข้อโพสต์:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ใครดูเรื่องนี้แล้วบ้าง? มาคุยกันหน่อย..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#E8A33D] focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-white/80">
                  เนื้อหาโพสต์ / ความรู้สึก:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="แชร์ความรู้สึก ฉากที่ประทับใจ หรือข้อคิดหลังดูจบ..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#E8A33D] focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-white/80">
                  แฮชแท็ก (คั่นด้วยจุลภาค ,):
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="อนิเมะ, โซเชียลเบต้า, แนะนำหนัง"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 placeholder-white/40 focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/10"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-full bg-[#E8A33D] px-5 py-2 text-xs font-bold text-[#0B0D11] hover:bg-[#f0b558] disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังโพสต์..." : "เผยแพร่โพสต์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

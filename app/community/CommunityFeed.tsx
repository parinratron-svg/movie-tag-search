"use client";

import { useState, useEffect, useTransition } from "react";
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
  AlertTriangle,
  Eye,
  EyeOff,
  Bookmark,
  Star,
  ThumbsUp,
  Laugh,
  Frown,
  Zap,
  TrendingUp,
  Award,
  Filter,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "SAD" | "WOW" | "FIRE";

export const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: "LIKE", emoji: "👍", label: "ชอบ", color: "text-blue-400" },
  { type: "LOVE", emoji: "❤️", label: "เลิฟ", color: "text-rose-400" },
  { type: "HAHA", emoji: "😂", label: "ขำขัน", color: "text-amber-400" },
  { type: "SAD", emoji: "😭", label: "ซึ้งใจ", color: "text-indigo-400" },
  { type: "WOW", emoji: "🤯", label: "ว้าว", color: "text-purple-400" },
  { type: "FIRE", emoji: "🔥", label: "ไฟลุก", color: "text-orange-400" },
];

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
  userReaction?: ReactionType | null;
  isSpoiler?: boolean;
  rating?: number | null;
}

interface TrendingPost {
  id: string;
  title: string;
  movie: {
    id: string;
    title: string;
    posterPath: string | null;
  } | null;
  likesCount: number;
  commentsCount: number;
}

interface TopContributor {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  postsCount: number;
}

function getPosterUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/w200${path}`;
}

export default function CommunityFeed({
  initialPosts,
  initialTrending,
  topContributors = [],
  currentUser,
}: {
  initialPosts: Post[];
  initialTrending: TrendingPost[];
  topContributors?: TopContributor[];
  currentUser: User | null;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [trending] = useState<TrendingPost[]>(initialTrending);
  const [activeTab, setActiveTab] = useState<"all" | "trending" | "reviews" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modal สร้างโพสต์
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieRating, setMovieRating] = useState<number | null>(null);
  const [isSpoilerPost, setIsSpoilerPost] = useState(false);
  const [tagsInput, setTagsInput] = useState("แนะนำ, รีวิวหนัง, โซเชียลเบต้า");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ค้นหาหนังสำหรับ Modal
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [movieSearchResults, setMovieSearchResults] = useState<Movie[]>([]);
  const [isSearchingMovie, setIsSearchingMovie] = useState(false);
  const [showMovieDropdown, setShowMovieDropdown] = useState(false);

  // Spoiler Unmask State
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  // Reaction Popup State (Active post hovering)
  const [hoveredReactionPostId, setHoveredReactionPostId] = useState<string | null>(null);

  // Saved / Bookmarked Posts
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  // Comments State
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    [initialPosts[0]?.id || ""]: true,
  });
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Saved Posts from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("saved_community_posts");
      if (saved) {
        try {
          setSavedPostIds(new Set(JSON.parse(saved)));
        } catch {}
      }
    }
  }, []);

  const toggleSavePost = (postId: string) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        showToast("ลบโพสต์ออกจากรายการบันทึกแล้ว");
      } else {
        next.add(postId);
        showToast("🔖 บันทึกโพสต์ไว้อ่านภายหลังแล้ว!");
      }
      localStorage.setItem("saved_community_posts", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // ค้นหาหนัง Realtime เมื่อพิมพ์
  useEffect(() => {
    if (!showMovieDropdown) return;
    const timer = setTimeout(async () => {
      if (!movieSearchQuery.trim()) {
        setMovieSearchResults([]);
        return;
      }
      setIsSearchingMovie(true);
      try {
        const res = await fetch(
          `/api/community/movies/search?q=${encodeURIComponent(movieSearchQuery)}`
        );
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

  // โหลดคอมเมนต์ของโพสต์
  const loadComments = async (postId: string) => {
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      const data = await res.json();
      if (res.ok && data.comments) {
        setCommentsMap((prev) => ({ ...prev, [postId]: data.comments }));
      }
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

  // จัดการ Reaction หลากหลายอารมณ์ (Multi-Emoji Reactions)
  const handleReaction = async (postId: string, reaction: ReactionType = "LIKE") => {
    if (!currentUser) {
      showToast("กรุณาเข้าสู่ระบบก่อนแสดงอารมณ์");
      return;
    }

    setHoveredReactionPostId(null);

    // Optimistic Update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isSameReaction = p.hasLiked && p.userReaction === reaction;
          return {
            ...p,
            hasLiked: !isSameReaction,
            userReaction: isSameReaction ? null : reaction,
            likesCount: isSameReaction ? Math.max(0, p.likesCount - 1) : p.hasLiked ? p.likesCount : p.likesCount + 1,
          };
        }
        return p;
      })
    );

    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likesCount: data.likesCount,
                  hasLiked: data.hasLiked,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Reaction Error:", err);
    }
  };

  // ส่งคอมเมนต์ใหม่
  const handleAddComment = async (postId: string) => {
    if (!currentUser) {
      showToast("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    const content = commentInputs[postId]?.trim();
    if (!content) return;

    // เคลียร์ input ทันที
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment],
        }));

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
          )
        );

        showToast("💬 เพิ่มความคิดเห็นสำเร็จแล้ว!");
      } else {
        showToast(data.error || "เกิดข้อผิดพลาดในการส่งความคิดเห็น");
      }
    } catch (err) {
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
      showToast("กรุณากรอกหัวข้อและเนื้อหาของโพสต์");
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      if (isSpoilerPost && !tags.includes("สปอยล์")) {
        tags.push("สปอยล์");
      }

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle.trim(),
          content: postContent.trim(),
          movieId: selectedMovie?.id || null,
          tags,
          isSpoiler: isSpoilerPost,
          rating: movieRating,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPosts((prev) => [data.post, ...prev]);
        setPostTitle("");
        setPostContent("");
        setSelectedMovie(null);
        setMovieRating(null);
        setIsSpoilerPost(false);
        setTagsInput("แนะนำ, รีวิวหนัง, โซเชียลเบต้า");
        setIsModalOpen(false);
        showToast("✨ เผยแพร่โพสต์ของคุณสำเร็จแล้ว!");
      } else {
        showToast(data.error || "สร้างโพสต์ไม่สำเร็จ");
      }
    } catch (err) {
      showToast("เกิดข้อผิดพลาดในการสร้างโพสต์");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Modal State
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ขอยืนยันการลบโพสต์ (เปิด Custom Modal สวยงาม ไม่ใช้ window.confirm)
  const handleDeletePost = (postId: string) => {
    if (!currentUser) return;
    setPostToDelete(postId);
  };

  // ดำเนินการลบโพสต์จริง
  const handleConfirmDelete = async () => {
    if (!postToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/community/posts/${postToDelete}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
        showToast("🗑️ ลบโพสต์เรียบร้อยแล้ว");
      } else {
        showToast(data.error || "เกิดข้อผิดพลาดในการลบโพสต์");
      }
    } catch (err) {
      showToast("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  // กรองโพสต์ตามเงื่อนไข (Search, Tag, Tab)
  const filteredPosts = posts.filter((post) => {
    // 1. กรองตาม Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchContent = post.content.toLowerCase().includes(q);
      const matchMovie = post.movie?.title.toLowerCase().includes(q);
      const matchTag = post.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchMovie && !matchTag) return false;
    }

    // 2. กรองตาม Tag
    if (selectedTag) {
      if (!post.tags.includes(selectedTag)) return false;
    }

    // 3. กรองตาม Tab
    if (activeTab === "trending") {
      return post.likesCount > 0 || post.commentsCount > 0;
    }
    if (activeTab === "reviews") {
      return post.movie !== null || post.tags.includes("รีวิว") || post.tags.includes("รีวิวหนัง");
    }
    if (activeTab === "saved") {
      return savedPostIds.has(post.id);
    }

    return true;
  });

  // รวบรวมแฮชแท็กยอดนิยม
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] selection:bg-[#E8A33D]/30 selection:text-[#E8A33D] pb-24 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#121A1A]/95 px-5 py-3 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-xl animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COMMUNITY HERO HEADER                                                  */}
      {/* ========================================================================= */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-[#161226] via-[#10131E] to-[#090A0F] px-4 py-12 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>โซเชียลเบต้า (Community Feed)</span>
              </div>
              <h1 className="mt-3 font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
                คอมมูนิตี้คนรักหนัง &amp; อนิเมะ 🍿
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-white/60 leading-relaxed">
                แลกเปลี่ยนความคิดเห็น แนะนำภาพยนตร์ รีวิวฉากที่ประทับใจ หรือพูดคุยเรื่องราวหลังดูจบกับเพื่อนๆ ในคอมมูนิตี้
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
              className="flex items-center justify-center gap-2.5 rounded-2xl border border-[#E8A33D] bg-gradient-to-r from-[#E8A33D] to-amber-500 px-6 py-3.5 text-sm font-bold text-black shadow-xl shadow-[#E8A33D]/25 transition-all hover:scale-105 hover:shadow-2xl active:scale-95 shrink-0"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
              <span>สร้างโพสต์ใหม่</span>
            </button>
          </div>

          {/* Search & Hashtag Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาโพสต์, ชื่อหนัง หรือแท็กที่สนใจ..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 backdrop-blur-md focus:border-[#E8A33D] focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/40 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Tag Filter Chips */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/20 transition flex items-center gap-1 shrink-0"
                  >
                    <span>ล้างแท็ก</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition shrink-0 ${
                      selectedTag === tag
                        ? "bg-[#E8A33D] text-black font-bold shadow-md"
                        : "bg-white/5 text-white/70 border border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN FEED & SIDEBAR GRID                                               */}
      {/* ========================================================================= */}
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* --------------------------------------------------------------------- */}
          {/* MAIN FEED COLUMN (8 COLS)                                             */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filter Tabs Navigation */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121520]/90 p-1.5 shadow-xl backdrop-blur-xl">
              <div className="grid grid-cols-4 gap-1 w-full">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "all"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>ฟีดทั้งหมด</span>
                </button>

                <button
                  onClick={() => setActiveTab("trending")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "trending"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span>กำลังมาแรง</span>
                </button>

                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "reviews"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  <span>รีวิวหนัง</span>
                </button>

                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs sm:text-sm font-semibold transition ${
                    activeTab === "saved"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5 text-blue-400" />
                  <span>ที่บันทึกไว้ ({savedPostIds.size})</span>
                </button>
              </div>
            </div>

            {/* Quick Post Box Trigger */}
            <div className="rounded-3xl border border-white/10 bg-[#141724]/90 p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-900/40">
                  {currentUser?.avatarUrl ? (
                    <Image
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#E8A33D]">
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
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-xs sm:text-sm text-white/50 transition hover:border-[#E8A33D]/50 hover:bg-white/10"
                >
                  คุณกำลังคิดอะไรอยู่? รีวิวหนัง หรือแลกเปลี่ยนความคิดเห็นกับเพื่อนๆ...
                </button>
              </div>
            </div>

            {/* Post Feed List */}
            {filteredPosts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#141724]/60 p-12 text-center">
                <Film className="mx-auto h-12 w-12 text-white/20" />
                <h3 className="mt-4 font-serif text-lg font-bold text-white">
                  ไม่พบโพสต์ที่ตรงกับเงื่อนไข
                </h3>
                <p className="mt-1 text-xs text-white/50">
                  ลองค้นหาด้วยคำอื่น หรือคลิกสร้างโพสต์แรกในหมวดหมู่นี้ได้เลย!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTag(null);
                    setActiveTab("all");
                  }}
                  className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isCommentsOpen = !!expandedComments[post.id];
                const postComments = commentsMap[post.id] || [];
                const isAuthor = currentUser?.id === post.user.id;
                const isSaved = savedPostIds.has(post.id);
                const hasSpoilerTag = post.tags.includes("สปอยล์") || post.isSpoiler;
                const isSpoilerRevealed = revealedSpoilers[post.id];

                return (
                  <article
                    key={post.id}
                    id={`post-${post.id}`}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-[#141724]/90 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20"
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between p-5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/15 bg-gradient-to-tr from-purple-900 to-indigo-900 shadow-md">
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
                            <span className="font-serif text-sm font-bold text-white">
                              {post.user.name}
                            </span>
                            {post.user.role === "ADMIN" && (
                              <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-white/40">
                            {new Date(post.createdAt).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* 7-Day Expiry Badge */}
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] text-white/50">
                          <Clock className="h-3 w-3 text-[#E8A33D]" />
                          <span>
                            {Math.max(1, 7 - Math.floor((Date.now() - new Date(post.createdAt).getTime()) / (24 * 60 * 60 * 1000)))} วัน
                          </span>
                        </span>

                        {/* Bookmark Button */}
                        <button
                          onClick={() => toggleSavePost(post.id)}
                          className={`rounded-full p-2 transition ${
                            isSaved
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "text-white/40 hover:bg-white/10 hover:text-white"
                          }`}
                          title="บันทึกโพสต์"
                        >
                          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-blue-400" : ""}`} />
                        </button>

                        {/* Delete Post Button (Owner or Admin) */}
                        {(isAuthor || currentUser?.role === "ADMIN") && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="rounded-full p-2 text-white/40 hover:bg-rose-500/20 hover:text-rose-400 transition"
                            title={currentUser?.role === "ADMIN" && !isAuthor ? "ลบโพสต์นี้ (สิทธิ์แอดมิน)" : "ลบโพสต์ของคุณ"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-5 py-2 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">
                          {post.title}
                        </h2>
                        {hasSpoilerTag && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 shrink-0">
                            <AlertTriangle className="h-3 w-3" />
                            <span>มีสปอยล์</span>
                          </span>
                        )}
                      </div>

                      {/* Spoiler Masking */}
                      {hasSpoilerTag && !isSpoilerRevealed ? (
                        <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 text-center space-y-2 backdrop-blur-md">
                          <p className="text-xs font-semibold text-rose-200">
                            ⚠️ โพสต์นี้ถูกระบุว่ามีเนื้อหาเปิดเผยจุดสำคัญ (Spoiler)
                          </p>
                          <button
                            onClick={() =>
                              setRevealedSpoilers((prev) => ({ ...prev, [post.id]: true }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/30 border border-rose-400/40 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-500/50 transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>คลิกเพื่ออ่านเนื้อหาสปอยล์</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm leading-relaxed text-white/80 whitespace-pre-line">
                          {post.content}
                        </p>
                      )}

                      {/* Attached Movie Card */}
                      {post.movie && (
                        <Link
                          href={`/movies/${post.movie.id}`}
                          className="group mt-3 flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-md transition hover:border-[#E8A33D]/50 hover:bg-black/60"
                        >
                          <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-md">
                            {getPosterUrl(post.movie.posterPath) ? (
                              <Image
                                src={getPosterUrl(post.movie.posterPath)!}
                                alt={post.movie.title}
                                fill
                                className="object-cover transition group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                                🎬
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-semibold text-[#E8A33D]">
                              ภาพยนตร์ที่แท็กในโพสต์
                            </span>
                            <h4 className="font-serif text-sm font-bold text-white truncate group-hover:text-[#E8A33D] transition">
                              {post.movie.title}
                            </h4>
                            <p className="text-[11px] text-white/50 truncate">
                              {post.movie.releaseYear ? `ปี ${post.movie.releaseYear} • ` : ""}
                              {post.movie.genres.join(", ") || "ภาพยนตร์"}
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#E8A33D] transition" />
                        </Link>
                      )}

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => setSelectedTag(tag)}
                              className="cursor-pointer rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60 hover:bg-[#E8A33D]/20 hover:text-[#E8A33D] transition"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Actions Bar */}
                    <div className="mt-3 border-t border-white/10 px-4 py-2 flex items-center justify-between text-xs text-white/60 relative">
                      
                      {/* Left: Interactive Multi-Emoji Reaction Button */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredReactionPostId(post.id)}
                        onMouseLeave={() => setHoveredReactionPostId(null)}
                      >
                        {/* Floating Emoji Selector Bar */}
                        {hoveredReactionPostId === post.id && (
                          <div className="absolute -top-12 left-0 z-30 flex items-center gap-1.5 rounded-full border border-white/20 bg-[#161928]/95 px-3 py-1.5 shadow-2xl backdrop-blur-xl animate-fadeIn">
                            {REACTIONS.map((r) => (
                              <button
                                key={r.type}
                                onClick={() => handleReaction(post.id, r.type)}
                                className="group relative flex items-center justify-center text-lg transform hover:scale-130 transition-transform p-1"
                                title={r.label}
                              >
                                <span>{r.emoji}</span>
                                <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 rounded-md bg-black/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow transition-opacity pointer-events-none">
                                  {r.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleReaction(post.id, "LIKE")}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium transition hover:bg-white/5 ${
                            post.hasLiked ? "text-rose-400 font-bold" : "hover:text-white"
                          }`}
                        >
                          <span className="text-base">
                            {post.hasLiked && post.userReaction
                              ? REACTIONS.find((r) => r.type === post.userReaction)?.emoji || "❤️"
                              : "👍"}
                          </span>
                          <span>
                            {post.hasLiked && post.userReaction
                              ? REACTIONS.find((r) => r.type === post.userReaction)?.label || "ถูกใจแล้ว"
                              : "ถูกใจ"}
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                            {post.likesCount}
                          </span>
                        </button>
                      </div>

                      {/* Center: Comments Toggle */}
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium transition hover:bg-white/5 hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>แสดงความคิดเห็น</span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                          {post.commentsCount}
                        </span>
                      </button>

                      {/* Right: Share Button */}
                      <button
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(`${window.location.origin}/community#post-${post.id}`);
                            showToast("🔗 คัดลอกลิงก์โพสต์เรียบร้อยแล้ว!");
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium transition hover:bg-white/5 hover:text-white"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>แชร์</span>
                      </button>
                    </div>

                    {/* Comment Section (Accordion) */}
                    {isCommentsOpen && (
                      <div className="border-t border-white/10 bg-black/30 p-5 space-y-4">
                        {/* Add Comment Input */}
                        <div className="flex items-start gap-3">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-purple-900/40">
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
                              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#E8A33D] focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!currentUser || !commentInputs[post.id]?.trim()}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[#E8A33D] p-1.5 text-black hover:bg-[#f3b355] disabled:opacity-30 transition"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Comments List */}
                        {loadingComments[post.id] ? (
                          <p className="text-center text-xs text-white/40 py-2">
                            กำลังโหลดความคิดเห็น...
                          </p>
                        ) : postComments.length === 0 ? (
                          <p className="text-center text-xs text-white/30 py-2">
                            ยังไม่มีความคิดเห็น ร่วมเป็นคนแรกที่ตอบกลับ!
                          </p>
                        ) : (
                          <div className="space-y-3 pt-2 max-h-60 overflow-y-auto pr-1">
                            {postComments.map((c) => (
                              <div key={c.id} className="flex items-start gap-3 text-xs">
                                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
                                  {c.user.avatarUrl ? (
                                    <Image
                                      src={c.user.avatarUrl}
                                      alt={c.user.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center font-bold text-[#E8A33D]">
                                      {c.user.name[0].toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 rounded-2xl bg-white/5 p-3 border border-white/5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-serif font-bold text-white">
                                      {c.user.name}
                                    </span>
                                    <span className="text-[10px] text-white/40">
                                      {new Date(c.createdAt).toLocaleTimeString("th-TH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-white/80">{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT SIDEBAR WIDGETS (4 COLS)                                        */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Widget 1: Trending Posts in Community */}
            <div className="rounded-3xl border border-white/10 bg-[#141724]/90 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                <h3 className="font-serif text-sm font-bold text-white">
                  โพสต์ยอดนิยมใน โซเชียลเบต้า
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {trending.length > 0 ? (
                  trending.map((t, idx) => (
                    <Link
                      key={t.id}
                      href={`/community#post-${t.id}`}
                      className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3 transition hover:border-[#E8A33D]/30 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-[#E8A33D]">
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-semibold text-white group-hover:text-[#E8A33D] transition line-clamp-1">
                            {t.title}
                          </h4>
                          <span className="text-[10px] text-white/40">
                            ❤️ {t.likesCount} • 💬 {t.commentsCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-white/40 text-center py-4">
                    ยังไม่มีโพสต์ยอดนิยม
                  </p>
                )}
              </div>
            </div>

            {/* Widget 2: Community Guidelines & Perks */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E1B2E]/90 to-[#121520]/90 p-6 shadow-2xl backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#E8A33D]" />
                <h3 className="font-serif text-sm font-bold text-white">
                  กติกาคอมมูนิตี้คนรักหนัง
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-white/70 leading-relaxed list-disc list-inside">
                <li>เคารพความคิดเห็นและแลกเปลี่ยนอย่างสุภาพ</li>
                <li>หากมีเนื้อหาสปอยล์ ให้เลือกแท็ก <span className="text-rose-400 font-bold">#สปอยล์</span> เสมอ</li>
                <li>แชร์รีวิวและภาพยนตร์ที่คุณชื่นชอบเพื่อรับ XP และเหรียญตรา</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: CREATE POST WITH RICH MOVIE TAG & SPOILER TOGGLE                */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-[#121422] p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E8A33D] to-amber-500 text-black">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white">
                  สร้างโพสต์ใหม่ในคอมมูนิตี้
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Tag Movie Search */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  แท็กภาพยนตร์ (ไม่บังคับ):
                </label>
                {selectedMovie ? (
                  <div className="flex items-center justify-between rounded-2xl border border-[#E8A33D]/40 bg-[#E8A33D]/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-lg bg-white/10">
                        {getPosterUrl(selectedMovie.posterPath) ? (
                          <Image
                            src={getPosterUrl(selectedMovie.posterPath)!}
                            alt={selectedMovie.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Film className="h-4 w-4 text-[#E8A33D]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{selectedMovie.title}</p>
                        <p className="text-[10px] text-white/60">
                          {selectedMovie.releaseYear ? `ปี ${selectedMovie.releaseYear} • ` : ""}
                          {selectedMovie.genres.join(", ")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMovie(null)}
                      className="rounded-full bg-white/10 p-1.5 text-white/60 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="พิมพ์ชื่อหนังเพื่อค้นหา..."
                      value={movieSearchQuery}
                      onChange={(e) => {
                        setMovieSearchQuery(e.target.value);
                        setShowMovieDropdown(true);
                      }}
                      onFocus={() => setShowMovieDropdown(true)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-[#E8A33D] focus:outline-none"
                    />
                    {showMovieDropdown && movieSearchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-20 max-h-48 overflow-y-auto rounded-2xl border border-white/15 bg-[#181B2C] p-2 shadow-2xl">
                        {movieSearchResults.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedMovie(m);
                              setShowMovieDropdown(false);
                              setMovieSearchQuery("");
                            }}
                            className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/10 transition"
                          >
                            <span className="font-bold text-xs text-white">{m.title}</span>
                            <span className="text-[10px] text-white/40">
                              {m.releaseYear ? `(${m.releaseYear})` : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  หัวข้อโพสต์:
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="เช่น ใครดูเรื่องนี้แล้วบ้าง? มาคุยกันหน่อย..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  เนื้อหาโพสต์:
                </label>
                <textarea
                  required
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="แชร์ความรู้สึก ฉากที่ประทับใจ หรือข้อคิดหลังดูจบ..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              {/* Spoiler & Tags Checkboxes */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-rose-300">
                  <input
                    type="checkbox"
                    checked={isSpoilerPost}
                    onChange={(e) => setIsSpoilerPost(e.target.checked)}
                    className="h-4 w-4 rounded accent-rose-500 cursor-pointer"
                  />
                  <span>⚠️ โพสต์นี้มีเนื้อหาสปอยล์หนัง (ซ่อนเนื้อหา)</span>
                </label>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  แฮชแท็ก (คั่นด้วยเครื่องหมายจุลภาค):
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="อนิเมะ, โซเชียลเบต้า, แนะนำหนัง"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 placeholder-white/40 focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !postTitle.trim() || !postContent.trim()}
                  className="rounded-2xl bg-gradient-to-r from-[#E8A33D] to-amber-500 px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#E8A33D]/20 hover:scale-105 transition disabled:opacity-40"
                >
                  {isSubmitting ? "กำลังเผยแพร่..." : "เผยแพร่โพสต์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CUSTOM DELETE POST CONFIRMATION MODAL                                  */}
      {/* ========================================================================= */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-[#121522] p-6 shadow-2xl shadow-rose-950/40">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-inner">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">
                  ยืนยันการลบโพสต์?
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-white/60">
                  คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้? โพสต์รวมถึงความคิดเห็นและรีแอคชันทั้งหมดจะถูกลบออกจากระบบอย่างถาวร
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPostToDelete(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>กำลังลบโพสต์...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>ยืนยันลบโพสต์</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface Wish {
  id: string;
  content: string;
  author_id: string;
  status: string;
  done_by: string | null;
  done_at: string | null;
  created_at: string;
  profiles: { display_name: string } | { display_name: string }[] | null;
}

function getDisplayName(wish: Wish): string {
  if (!wish.profiles) return "匿名";
  if (Array.isArray(wish.profiles)) return wish.profiles[0]?.display_name || "匿名";
  return wish.profiles.display_name || "匿名";
}

export default function WishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchWishes();
  }, []);

  const fetchWishes = () => {
    supabase
      .from("wishes")
      .select("*, profiles(display_name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setWishes(data || []));
  };

  const handleAdd = async () => {
    if (!content.trim()) { alert("请输入心愿内容"); return; }
    if (!user) { alert("请先登录"); return; }
    setAdding(true);
    const { error } = await supabase.from("wishes").insert({
      content: content.trim(),
      author_id: user.id,
    }).select();
    if (error) {
      alert("许愿失败: " + error.message);
    } else {
      setContent("");
      fetchWishes();
    }
    setAdding(false);
  };

  const handleToggle = async (wish: Wish) => {
    if (!user || wish.author_id !== user.id) return;
    const newStatus = wish.status === "done" ? "pending" : "done";
    await supabase
      .from("wishes")
      .update({
        status: newStatus,
        done_by: newStatus === "done" ? user.id : null,
        done_at: newStatus === "done" ? new Date().toISOString() : null,
      })
      .eq("id", wish.id);
    fetchWishes();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("wishes").delete().eq("id", id);
    fetchWishes();
  };

  const filtered = wishes.filter((w) => (filter === "all" ? true : w.status === filter));
  const pendingCount = wishes.filter((w) => w.status === "pending").length;
  const doneCount = wishes.filter((w) => w.status === "done").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-cream-950 font-hand mb-2">💝 心愿单</h1>
        <p className="text-sm text-cream-500">一起许下心愿，一起实现它们</p>
      </div>

      {/* Add wish */}
      {user && (
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="写下你的心愿..."
            className="flex-1 px-4 py-2 border border-cream-200 rounded-full text-sm bg-white focus:outline-none focus:border-cream-400"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="px-5 py-2 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 disabled:opacity-50"
          >
            {adding ? "..." : "许愿"}
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-cream-100 rounded-full p-1 mb-6 w-fit mx-auto">
        {[
          ["all", `全部 (${wishes.length})`],
          ["pending", `未实现 (${pendingCount})`],
          ["done", `已实现 (${doneCount})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-1.5 rounded-full text-xs transition-colors ${
              filter === key ? "bg-cream-400 text-white" : "text-cream-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Wish list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-cream-400">
            <p className="text-3xl mb-2">💭</p>
            <p>还没有心愿</p>
          </div>
        )}
        {filtered.map((wish) => (
          <div
            key={wish.id}
            className={`p-4 rounded-xl border transition-all ${
              wish.status === "done"
                ? "bg-cream-50/50 border-cream-200 opacity-60"
                : "bg-white border-cream-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {user && wish.author_id === user.id && (
                <button
                  onClick={() => handleToggle(wish)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    wish.status === "done"
                      ? "bg-cream-400 border-cream-400 text-white"
                      : "border-cream-300 hover:border-cream-400"
                  }`}
                >
                  {wish.status === "done" && <span className="text-[10px]">✓</span>}
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className={`${wish.status === "done" ? "line-through text-cream-400" : "text-cream-900"}`}>
                  {wish.content}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-cream-400">
                    {getDisplayName(wish)} · {formatDate(wish.created_at)}
                  </span>
                  {wish.status === "done" && <span className="text-xs text-cream-400">🎉 已实现</span>}
                </div>
              </div>
              {user && wish.author_id === user.id && (
                <button
                  onClick={() => handleDelete(wish.id)}
                  className="text-xs text-cream-300 hover:text-red-400 flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

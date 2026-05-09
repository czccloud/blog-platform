"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import TabBar from "@/components/TabBar";
import MemberList from "@/components/MemberList";

type Tab = "articles" | "drafts" | "members";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [posts, setPosts] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }

      supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          setUserRole(profile?.role || "");
        });

      supabase
        .from("posts")
        .select("id, title, slug, status, created_at, updated_at")
        .eq("author_id", data.user.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .then(({ data: p }) => setPosts(p || []));

      supabase
        .from("posts")
        .select("id, title, slug, status, updated_at")
        .eq("author_id", data.user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .then(({ data: d }) => setDrafts(d || []));

      supabase
        .from("profiles")
        .select("id, email, display_name, role, created_at")
        .order("created_at", { ascending: true })
        .then(({ data: m }) => setMembers(m || []));

      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("posts").delete().eq("id", id);
    setPosts((p) => p.filter((x) => x.id !== id));
    setDrafts((d) => d.filter((x) => x.id !== id));
  };

  if (loading) {
    return <div className="p-8 text-center text-cream-500">加载中...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-cream-950">📋 管理</h1>
        <Link
          href="/admin/new"
          className="px-4 py-1.5 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 transition-colors"
        >
          + 写新文章
        </Link>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} draftCount={drafts.length} />

      {activeTab === "articles" && (
        <div className="space-y-2">
          {posts.length === 0 && <p className="text-center text-cream-500 py-8">还没有发布文章</p>}
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-cream-200"
            >
              <div>
                <p className="text-sm font-medium text-cream-950">{post.title}</p>
                <p className="text-xs text-cream-500">
                  {new Date(post.created_at).toLocaleDateString("zh-CN")} · 已发布
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <Link href={`/admin/edit?id=${post.id}`} className="text-cream-600 hover:text-cream-700">
                  编辑
                </Link>
                <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-500">
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "drafts" && (
        <div className="space-y-2">
          {drafts.length === 0 && <p className="text-center text-cream-500 py-8">没有草稿</p>}
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-cream-200"
            >
              <div>
                <p className="text-sm font-medium text-cream-700">{draft.title}</p>
                <p className="text-xs text-cream-400">
                  草稿 · 上次编辑 {new Date(draft.updated_at).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <Link href={`/admin/edit?id=${draft.id}`} className="text-cream-600 hover:text-cream-700">
                  继续写
                </Link>
                <button onClick={() => handleDelete(draft.id)} className="text-red-400 hover:text-red-500">
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "members" && (
        <div>
          <div className="flex justify-end mb-4">
            <Link
              href="/admin/invite"
              className="px-4 py-1.5 border border-cream-300 text-cream-700 rounded-full text-sm hover:bg-cream-100"
            >
              ✉️ 邀请成员
            </Link>
          </div>
          <MemberList members={members} />
        </div>
      )}
    </div>
  );
}

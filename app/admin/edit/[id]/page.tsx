"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import { createClient } from "@/lib/supabase/client";

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setWeather(data.weather || "");
          setMood(data.mood || "");
          setLocation(data.location || "");
          setStatus(data.status);
        }
        setLoading(false);
      });
  }, [id]);

  const save = async (newStatus: "draft" | "published") => {
    setSaving(true);
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        excerpt: content.replace(/[#*`!\[\]()]/g, "").substring(0, 150),
        weather,
        mood,
        location,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error) {
      router.push("/admin");
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-cream-500">加载中...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-cream-950">✏️ 编辑文章</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="px-4 py-1.5 border border-cream-300 text-cream-700 rounded-full text-sm hover:bg-cream-100 disabled:opacity-50"
          >
            存草稿
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="px-4 py-1.5 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 disabled:opacity-50"
          >
            {status === "published" ? "更新" : "发布"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700"
        >
          <option value="">☀️ 天气</option>
          <option value="晴">☀️ 晴</option>
          <option value="雨">🌧️ 雨</option>
          <option value="阴">☁️ 阴</option>
          <option value="雪">❄️ 雪</option>
        </select>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700"
        >
          <option value="">💭 心情</option>
          <option value="😊">😊 开心</option>
          <option value="😌">😌 平静</option>
          <option value="🤔">🤔 思考</option>
          <option value="😢">😢 难过</option>
        </select>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="📍 地点"
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700 w-32"
        />
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="文章标题..."
        className="w-full text-xl font-bold text-cream-950 mb-4 px-2 py-1 border-0 border-b border-cream-200 focus:outline-none focus:border-cream-400 bg-transparent"
      />

      <div className="grid grid-cols-2 gap-0 border border-cream-200 rounded-lg overflow-hidden bg-white min-h-[500px]">
        <MarkdownEditor value={content} onChange={setContent} />
        <div className="border-l border-cream-200 bg-white overflow-auto">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}

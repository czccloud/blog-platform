"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import { createClient } from "@/lib/supabase/client";
import { cleanExcerpt } from "@/lib/utils";

function EditForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;
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
          setCoverImage(data.cover_image || "");
          setStatus(data.status);
        }
        setLoading(false);
      });
  }, [id]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploadingCover(true);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `cover_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("blog-images").upload(fileName, file);
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(data.path);
      setCoverImage(urlData.publicUrl);
    }
    setUploadingCover(false);
  };

  const extractFirstImage = (md: string): string => {
    const match = md.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    return match ? match[1] : "";
  };

  const save = async (newStatus: "draft" | "published") => {
    if (!id) return;
    setSaving(true);
    const cover = coverImage || extractFirstImage(content);
    const { error } = await supabase.from("posts").update({
      title, content,
      excerpt: cleanExcerpt(content),
      cover_image: cover,
      weather, mood, location,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (!error) { router.push("/admin"); router.refresh(); }
    setSaving(false);
  };

  if (!id) return <div className="p-8 text-center text-cream-500">缺少文章 ID</div>;
  if (loading) return <div className="p-8 text-center text-cream-500">加载中...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-cream-950">✏️ 编辑文章</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => save("draft")} disabled={saving}
            className="px-4 py-1.5 border border-cream-300 text-cream-700 rounded-full text-sm hover:bg-cream-100 disabled:opacity-50">
            存草稿
          </button>
          <button onClick={() => save("published")} disabled={saving}
            className="px-4 py-1.5 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 disabled:opacity-50">
            {status === "published" ? "更新" : "发布"}
          </button>
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <select value={weather} onChange={(e) => setWeather(e.target.value)} className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700">
          <option value="">☀️ 天气</option>
          <option value="晴">☀️ 晴</option><option value="雨">🌧️ 雨</option><option value="阴">☁️ 阴</option><option value="雪">❄️ 雪</option>
        </select>
        <select value={mood} onChange={(e) => setMood(e.target.value)} className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700">
          <option value="">💭 心情</option>
          <option value="😊">😊 开心</option><option value="😌">😌 平静</option><option value="🤔">🤔 思考</option><option value="😢">😢 难过</option>
        </select>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="📍 地点" className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700 w-32" />
        <label className="px-3 py-1 border border-dashed border-cream-300 rounded-full text-xs bg-cream-50 text-cream-500 cursor-pointer hover:border-cream-400">
          {uploadingCover ? "上传中..." : coverImage ? "🖼️ 封面已选" : "🖼️ 封面图"}
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
        </label>
        {coverImage && <button onClick={() => setCoverImage("")} className="text-xs text-red-400 hover:text-red-500">清除</button>}
      </div>
      {coverImage && <div className="mb-4 h-32 rounded-lg overflow-hidden"><img src={coverImage} alt="封面预览" className="w-full h-full object-cover" /></div>}
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题..." className="w-full text-xl font-bold text-cream-950 mb-4 px-2 py-1 border-0 border-b border-cream-200 focus:outline-none focus:border-cream-400 bg-transparent" />
      <div className="grid grid-cols-2 gap-0 border border-cream-200 rounded-lg overflow-hidden bg-white min-h-[500px]">
        <MarkdownEditor value={content} onChange={setContent} />
        <div className="border-l border-cream-200 bg-white overflow-auto"><MarkdownPreview content={content} /></div>
      </div>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-cream-500">加载中...</div>}>
      <EditForm />
    </Suspense>
  );
}

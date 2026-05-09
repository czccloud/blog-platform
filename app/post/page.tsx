"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LetterHeader from "@/components/LetterHeader";
import LetterFooter from "@/components/LetterFooter";
import CommentSection from "@/components/CommentSection";

function PostContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("posts")
      .select("*, profiles(display_name)")
      .eq("slug", slug)
      .eq("status", "published")
      .single()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (!slug) {
    return (
      <div className="text-center py-20 text-cream-400">
        <p>文章不存在</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-cream-400">
        <p>加载中...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 text-cream-400">
        <p>文章不存在</p>
      </div>
    );
  }

  const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;

  return (
    <article className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white/90 rounded-lg p-6 md:p-10 shadow-sm border-l-4 border-cream-400 relative">
        <div className="absolute top-4 right-6 w-10 h-10 border-2 border-cream-300 rounded-full flex items-center justify-center text-[8px] text-cream-500">
          邮票
        </div>

        <LetterHeader
          title={post.title}
          authorName={profile?.display_name || "匿名"}
          date={post.created_at}
          weather={post.weather}
          mood={post.mood}
          location={post.location}
        />

        <div className="prose prose-stone max-w-none font-serif text-cream-900 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <LetterFooter authorName={profile?.display_name || "匿名"} />
      </div>
      <CommentSection postId={post.id} />
    </article>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-cream-400">加载中...</div>}>
      <PostContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ImageItem {
  url: string;
  alt: string;
  postTitle: string;
  postSlug: string;
}

export default function PhotosPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("posts")
      .select("title, slug, content")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const imgs: ImageItem[] = [];
        for (const post of data || []) {
          const regex = /!\[([^\]]*)\]\((\S+)\)/g;
          let match;
          while ((match = regex.exec(post.content)) !== null) {
            const url = match[2];
            if (url.startsWith("http") && !url.includes("uploading") && !url.includes("上传失敗")) {
              imgs.push({ url, alt: match[1], postTitle: post.title, postSlug: post.slug });
            }
          }
        }
        setImages(imgs);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-cream-950 font-hand mb-2">📸 生活影集</h1>
        <p className="text-sm text-cream-500">
          {loading ? "加载中..." : `${images.length} 张照片`}
        </p>
      </div>

      {images.length === 0 && !loading ? (
        <div className="text-center py-20 text-cream-400">
          <p className="text-4xl mb-4">📷</p>
          <p>等待第一张照片...</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <Link
              key={i}
              href={`/post?slug=${img.postSlug}`}
              className="block break-inside-avoid rounded-xl overflow-hidden border border-cream-200 bg-white hover:shadow-md transition-shadow group"
            >
              <img src={img.url} alt={img.alt} className="w-full object-cover" loading="lazy" />
              <div className="p-3">
                <p className="text-xs text-cream-400 truncate">📍 {img.postTitle}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

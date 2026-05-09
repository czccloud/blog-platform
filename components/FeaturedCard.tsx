import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  author_id: string;
  profiles: { display_name: string };
  created_at: string;
  weather: string;
  mood: string;
  location: string;
  comments: { count: number }[];
}

export default function FeaturedCard({ post }: { post: Post }) {
  const weatherEmoji = post.weather
    ? { "晴": "☀️", "雨": "🌧️", "阴": "☁️", "雪": "❄️" }[post.weather] || ""
    : "";
  const moodEmoji = post.mood || "";

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block card-paper rounded-2xl overflow-hidden border border-cream-200 hover:border-cream-300 transition-all relative group"
    >
      {/* Tape decoration */}
      <div className="tape absolute -top-2 left-8 w-12 h-5 -rotate-3 z-10" />
      <div className="tape absolute -top-2 right-10 w-10 h-4 rotate-2 z-10" />

      {/* Cover image */}
      <div className="aspect-[16/10] overflow-hidden">
        {post.cover_image ? (
          <img src={post.cover_image} alt="" className="w-full h-full object-cover img-hover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cream-200 via-cream-300 to-cream-400 flex items-center justify-center">
            <span className="text-5xl opacity-40">📷</span>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-cream-500 mb-3">
          <span className="bg-cream-100 text-cream-600 px-2 py-0.5 rounded-full">📌 精选</span>
          {weatherEmoji && <span>{weatherEmoji}</span>}
          {moodEmoji && <span>{moodEmoji}</span>}
          {post.location && <span>📍 {post.location}</span>}
        </div>

        <h2 className="text-xl font-bold text-cream-950 mb-2 font-hand group-hover:text-cream-700 transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-cream-700 mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-cream-400 pt-3 border-t border-cream-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-cream-300 rounded-full flex items-center justify-center text-white text-[10px]">
              {post.profiles.display_name.charAt(0)}
            </div>
            <span>{post.profiles.display_name}</span>
            <span className="divider-dot" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          {post.comments?.[0]?.count > 0 && (
            <span>💬 {post.comments[0].count} 封回信</span>
          )}
        </div>
      </div>
    </Link>
  );
}

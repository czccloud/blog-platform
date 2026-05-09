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
  const moodEmoji = post.mood || "💭";

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block bg-white rounded-xl p-6 border-2 border-dashed border-cream-300 hover:border-cream-400 transition-colors relative"
    >
      <div className="absolute -top-3 left-6 w-10 h-4 bg-cream-400/60 rounded-sm -rotate-3" />
      <div className="flex items-center gap-2 text-xs text-cream-500 mb-2">
        <span>📌 精选</span>
        {weatherEmoji && <span>{weatherEmoji}</span>}
        {moodEmoji && <span>{moodEmoji}</span>}
      </div>
      <h2 className="text-lg font-bold text-cream-950 mb-2">{post.title}</h2>
      <p className="text-sm text-cream-700 mb-3 line-clamp-2">{post.excerpt}</p>
      {post.location && <p className="text-xs text-cream-400 mb-2">📍 {post.location}</p>}
      <div className="flex gap-2 mb-3">
        <div className="h-10 flex-1 bg-gradient-to-br from-green-200 to-green-300 rounded" />
        <div className="h-10 flex-1 bg-gradient-to-br from-orange-200 to-orange-300 rounded" />
        <div className="h-10 flex-1 bg-gradient-to-br from-blue-200 to-blue-300 rounded" />
      </div>
      <div className="text-xs text-cream-500 flex items-center gap-2">
        <span>{post.profiles.display_name} · {formatDate(post.created_at)}</span>
        {post.comments?.[0]?.count > 0 && (
          <span>💬 {post.comments[0].count} 封回信</span>
        )}
      </div>
    </Link>
  );
}

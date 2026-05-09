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
  comments: { count: number }[];
}

export default function PostCard({ post }: { post: Post }) {
  const weatherEmoji = post.weather
    ? { "晴": "☀️", "雨": "🌧️", "阴": "☁️", "雪": "❄️" }[post.weather] || "📝"
    : "📝";

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block bg-white rounded-lg p-4 border border-cream-200 hover:border-cream-300 transition-colors relative"
    >
      <div className="absolute -top-2 right-4 w-8 h-3 bg-cream-400/60 rounded-sm rotate-3" />
      <div className="flex gap-3 items-start">
        <div className="w-12 h-12 bg-gradient-to-br from-cream-300 to-cream-400 rounded-md flex items-center justify-center text-xl flex-shrink-0">
          {weatherEmoji}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-cream-950 text-sm truncate">{post.title}</h3>
          <p className="text-xs text-cream-500 mt-0.5">
            {post.profiles.display_name} · {formatDate(post.created_at)}
            {post.comments?.[0]?.count > 0 && (
              <span className="ml-2">💬 {post.comments[0].count}</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

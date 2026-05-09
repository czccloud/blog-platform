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

export default function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-24 text-cream-500">
        <p className="text-6xl mb-6">✂️</p>
        <p className="text-xl font-hand text-cream-700 mb-3">还没有文章</p>
        <p className="text-sm" style={{fontFamily:"Nunito"}}>等待第一份生活记录...</p>
      </div>
    );
  }

  const featured = posts.slice(0, 2);
  const rest = posts.slice(2);

  return (
    <div className="space-y-8">
      {/* Two featured cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {featured.map((post, i) => (
          <FeaturedCard key={post.id} post={post} index={i} />
        ))}
      </div>

      {/* Rest as a grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination hint */}
      {posts.length >= 20 && (
        <div className="text-center pt-6">
          <span className="bg-cream-100 text-cream-500 px-5 py-2 rounded-full text-sm font-hand">
            ← 更早的记录 →
          </span>
        </div>
      )}
    </div>
  );
}

function FeaturedCard({ post, index }: { post: Post; index: number }) {
  const weatherEmoji = post.weather
    ? { "晴": "☀️", "雨": "🌧️", "阴": "☁️", "雪": "❄️" }[post.weather] || ""
    : "";
  const moodEmoji = post.mood || "";

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="card-clay overflow-hidden group relative"
    >
      {/* Tape */}
      <div className="tape absolute -top-2 left-6 w-14 h-5 -rotate-3 z-10" />
      <div className="tape absolute -top-2 right-8 w-12 h-4 rotate-2 z-10" />

      {/* Cover image */}
      {post.cover_image && (
        <div className="aspect-[16/10] overflow-hidden rounded-t-[17px]">
          <img src={post.cover_image} alt="" className="w-full h-full object-cover img-hover" />
        </div>
      )}

      <div className={`p-5 ${!post.cover_image ? "pt-8" : ""}`}>
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-cream-500 mb-3">
          <span className="bg-cream-100 text-cream-600 px-2 py-0.5 rounded-full font-hand">📌 精选</span>
          {weatherEmoji && <span>{weatherEmoji}</span>}
          {moodEmoji && <span>{moodEmoji}</span>}
          {post.location && <span>📍 {post.location}</span>}
        </div>

        <h2 className="text-xl font-bold text-cream-950 mb-2 font-hand group-hover:text-cream-700 transition-colors leading-snug">
          {post.title}
        </h2>
        <p className="text-sm text-cream-700 mb-4 line-clamp-2 leading-relaxed">
          {post.excerpt || "点击阅读..."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-cream-400 pt-3 border-t border-cream-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cream-300 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {post.profiles.display_name.charAt(0)}
            </div>
            <span>{post.profiles.display_name}</span>
            <span className="divider-dot" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          {post.comments?.[0]?.count > 0 && (
            <span className="text-cream-500">💬 {post.comments[0].count}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="card-clay-flat overflow-hidden group relative"
    >
      {/* Tiny tape */}
      <div className="tape absolute -top-1.5 right-4 w-10 h-3 rotate-3 z-10" />

      {/* Cover image */}
      {post.cover_image && (
        <div className="aspect-[4/3] overflow-hidden rounded-t-[18px]">
          <img src={post.cover_image} alt="" className="w-full h-full object-cover img-hover" />
        </div>
      )}

      <div className={`p-4 ${!post.cover_image ? "pt-6" : ""}`}>
        <h3 className="font-bold text-cream-950 text-base font-hand group-hover:text-cream-700 transition-colors leading-snug mb-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-xs text-cream-600 line-clamp-2 mb-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-cream-400">
          <span>{post.profiles.display_name}</span>
          <div className="flex items-center gap-2">
            <span>{formatDate(post.created_at)}</span>
            {post.comments?.[0]?.count > 0 && <span>💬 {post.comments[0].count}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

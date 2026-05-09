import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await getServerSupabase();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, cover_image, author_id, created_at, weather, mood, location, profiles!inner(display_name), comments(count)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20);

  const postList = (posts as any[]) || [];
  const weatherMap: Record<string, string> = { "晴": "☀️", "雨": "🌧️", "阴": "☁️", "雪": "❄️" };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Title */}
      <h1 className="text-2xl font-bold text-cream-950 font-hand text-center mb-6">
        🏠 我们的剪贴簿
      </h1>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-cream-100 rounded-full p-1 mb-6 w-fit mx-auto">
        <span className="px-5 py-2 bg-cream-400 text-white rounded-full text-sm font-hand font-semibold">
          📝 文章
        </span>
        <Link href="/photos" className="px-5 py-2 text-cream-600 hover:text-cream-800 rounded-full text-sm font-hand transition-colors">
          📸 影集
        </Link>
        <Link href="/wishes" className="px-5 py-2 text-cream-600 hover:text-cream-800 rounded-full text-sm font-hand transition-colors">
          💝 心愿
        </Link>
      </div>

      {/* Article list */}
      {postList.length === 0 ? (
        <div className="text-center py-16 text-cream-400">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm">还没有文章</p>
        </div>
      ) : (
        <div className="space-y-3">
          {postList.map((post: any) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="block bg-white rounded-xl p-3 border border-cream-200 hover:border-cream-300 transition-all hover:shadow-sm group"
            >
              <div className="flex items-center gap-3">
                {/* Thumbnail - only if cover */}
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-cream-950 font-hand group-hover:text-cream-700 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-cream-400 mt-1">
                    <span>{post.profiles?.display_name}</span>
                    <span>·</span>
                    <span>{formatDate(post.created_at)}</span>
                    {post.weather && (
                      <>
                        <span>·</span>
                        <span>
                          {weatherMap[post.weather] || post.weather}
                        </span>
                      </>
                    )}
                    {post.mood && (
                      <>
                        <span>·</span>
                        <span>{post.mood}</span>
                      </>
                    )}
                    {post.comments?.[0]?.count > 0 && (
                      <>
                        <span>·</span>
                        <span>💬 {post.comments[0].count}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-cream-300 group-hover:text-cream-500 transition-colors text-lg flex-shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import PostList from "@/components/PostList";

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-cream-400 rounded-full flex items-center justify-center text-white text-sm">
          ✂️
        </div>
        <h1 className="text-xl font-bold text-cream-950 font-hand">我们的生活记录</h1>
      </div>

      {/* Feature entry cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/photos"
          className="card-clay overflow-hidden group p-4 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cream-300 to-cream-400 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
            📸
          </div>
          <div>
            <h2 className="font-hand font-bold text-cream-950 text-lg">生活影集</h2>
            <p className="text-xs text-cream-500 mt-0.5">浏览所有照片</p>
          </div>
        </Link>
        <Link
          href="/wishes"
          className="card-clay overflow-hidden group p-4 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cream-300 to-cream-400 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
            💝
          </div>
          <div>
            <h2 className="font-hand font-bold text-cream-950 text-lg">心愿单</h2>
            <p className="text-xs text-cream-500 mt-0.5">一起许愿打卡</p>
          </div>
        </Link>
      </div>

      <PostList posts={(posts as any[]) || []} />
    </div>
  );
}

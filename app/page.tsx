import { getServerSupabase } from "@/lib/supabase/server";
import PostList from "@/components/PostList";

export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await getServerSupabase();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, cover_image, author_id, created_at, weather, mood, location, profiles!inner(display_name)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-cream-400 rounded-full flex items-center justify-center text-white text-sm">
          ✂️
        </div>
        <h1 className="text-xl font-bold text-cream-950">我们的生活记录</h1>
      </div>
      <PostList posts={(posts as any[]) || []} />
    </div>
  );
}

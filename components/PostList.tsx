import FeaturedCard from "./FeaturedCard";
import PostCard from "./PostCard";

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
      <div className="text-center py-20 text-cream-500">
        <p className="text-5xl mb-6">✂️</p>
        <p className="text-lg font-hand text-cream-700 mb-2">还没有文章</p>
        <p className="text-sm">等待第一份生活记录...</p>
      </div>
    );
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-6">
      <FeaturedCard post={featured} />
      <div className="space-y-3">
        {rest.length > 0 ? (
          rest.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="card-paper rounded-xl p-8 text-center text-cream-400 text-sm border border-cream-200 flex items-center justify-center min-h-[200px]">
            <div>
              <p className="text-3xl mb-3">📝</p>
              <p>期待更多故事...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

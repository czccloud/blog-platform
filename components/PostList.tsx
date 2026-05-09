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
        <p className="text-4xl mb-4">📝</p>
        <p>还没有文章，等待第一份生活记录...</p>
      </div>
    );
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <FeaturedCard post={featured} />
      <div className="space-y-3">
        {rest.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

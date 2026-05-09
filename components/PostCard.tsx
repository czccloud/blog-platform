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
  return (
    <Link
      href={`/post?slug=${post.slug}`}
      className="block card-paper rounded-xl p-3 border border-cream-200 hover:border-cream-300 transition-all relative group"
    >
      {/* Tiny tape */}
      <div className="tape absolute -top-1.5 right-3 w-8 h-2.5 rotate-3" />

      <div className="flex gap-3">
        {/* Thumbnail - only show if cover image exists */}
        {post.cover_image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img src={post.cover_image} alt="" className="w-full h-full object-cover img-hover" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-cream-950 text-sm truncate group-hover:text-cream-700 transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-cream-400 mt-1">
            <span>{post.profiles.display_name}</span>
            <span>·</span>
            <span>{formatDate(post.created_at)}</span>
            {post.comments?.[0]?.count > 0 && (
              <>
                <span>·</span>
                <span>💬 {post.comments[0].count}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

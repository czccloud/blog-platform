import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LetterHeader from "@/components/LetterHeader";
import LetterFooter from "@/components/LetterFooter";

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = getAdminClient();
  const { data } = await supabase.from("posts").select("slug").eq("status", "published");
  return (data || []).map((p: { slug: string }) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await getServerSupabase();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles!inner(display_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white/90 rounded-lg p-6 md:p-10 shadow-sm border-l-4 border-cream-400 relative">
        <div className="absolute top-4 right-6 w-10 h-10 border-2 border-cream-300 rounded-full flex items-center justify-center text-[8px] text-cream-500">
          邮票
        </div>

        <LetterHeader
          title={post.title}
          authorName={(post.profiles as any).display_name}
          date={post.created_at}
          weather={post.weather}
          mood={post.mood}
          location={post.location}
        />

        <div className="prose prose-stone max-w-none font-serif text-cream-900 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <LetterFooter authorName={(post.profiles as any).display_name} />
      </div>
    </article>
  );
}

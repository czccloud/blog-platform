"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: { display_name: string } | null;
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [posting, setPosting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    supabase
      .from("comments")
      .select("id, content, author_id, created_at, profiles!inner(display_name)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments(data || []));
  }, [postId]);

  const handlePost = useCallback(async () => {
    if (!content.trim() || !user) return;
    setPosting(true);

    const { data: inserted, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: user.id, content: content.trim() })
      .select("id, content, author_id, created_at")
      .single();

    if (!error && inserted) {
      const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "";
      setComments((prev) => [
        ...prev,
        { ...inserted, profiles: { display_name: displayName } },
      ]);
      setContent("");
    }
    setPosting(false);
  }, [content, user, postId]);

  return (
    <div className="mt-12 pt-8 border-t border-cream-200">
      <h3 className="text-lg font-bold text-cream-950 font-serif mb-6">
        回信 ({comments.length})
      </h3>

      {user ? (
        <div className="flex gap-3 mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写一封回信..."
            rows={3}
            className="flex-1 px-4 py-3 border border-cream-200 rounded-lg focus:outline-none focus:border-cream-400 bg-cream-50 text-sm resize-none"
          />
          <button
            onClick={handlePost}
            disabled={posting || !content.trim()}
            className="self-end px-4 py-2 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 disabled:opacity-50 transition-colors"
          >
            {posting ? "发送中..." : "回复"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-cream-500 mb-8">
          登录后才能回信
        </p>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-white/70 rounded-lg p-4 border border-cream-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-cream-300 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {(c.profiles?.display_name || "?").charAt(0)}
              </div>
              <span className="text-sm font-medium text-cream-800">
                {c.profiles?.display_name || "匿名"}
              </span>
              <span className="text-xs text-cream-400">
                {formatDate(c.created_at)}
              </span>
            </div>
            <p className="text-sm text-cream-900 pl-8">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

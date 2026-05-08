"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import InviteCodeList from "@/components/InviteCodeList";
import Link from "next/link";

export default function InvitePage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }

      supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.role !== "admin") {
            router.push("/admin");
            return;
          }
          setIsAdmin(true);
        });

      supabase
        .from("invites")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data: inv }) => {
          setInvites(inv || []);
          setChecking(false);
        });
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("invites")
      .insert({ code, created_by: userData.user.id })
      .select()
      .single();

    if (!error && data) {
      setInvites((prev) => [data, ...prev]);
    }
  }, []);

  if (checking) return <div className="p-8 text-center text-cream-500">加载中...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-cream-500 hover:text-cream-600">
          ← 返回
        </Link>
        <h1 className="text-xl font-bold text-cream-950">✉️ 邀请成员</h1>
      </div>
      <InviteCodeList invites={invites} onGenerate={handleGenerate} />
    </div>
  );
}

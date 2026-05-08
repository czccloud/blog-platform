"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setUser(null);
  };

  return (
    <header className="border-b border-cream-200 bg-cream-50/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-cream-950 text-lg">
          ✂️ 我们的剪贴簿
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/admin" className="text-cream-800 hover:text-cream-600">
                管理
              </Link>
              <button onClick={handleLogout} className="text-cream-500 hover:text-cream-600">
                退出
              </button>
            </>
          ) : (
            <Link href="/login" className="text-cream-800 hover:text-cream-600">
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

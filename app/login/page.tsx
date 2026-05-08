"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("邮箱或密码错误");
    } else {
      router.push("/admin");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-cream-200">
        <h1 className="text-2xl font-bold text-cream-950 mb-6 text-center">登录</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-cream-800 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:border-cream-400 bg-cream-50"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-cream-800 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:border-cream-400 bg-cream-50"
              placeholder="••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-cream-500 text-white rounded-lg hover:bg-cream-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-cream-500">
          还没有账号？{" "}
          <Link href="/register" className="text-cream-600 hover:text-cream-700 font-medium">
            通过邀请注册
          </Link>
        </p>
      </div>
    </div>
  );
}

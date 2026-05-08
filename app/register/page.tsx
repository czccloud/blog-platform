"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validInvite, setValidInvite] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const supabase = createClient();

  useEffect(() => {
    if (inviteCode) {
      supabase
        .from("invites")
        .select("id, used_by, expires_at")
        .eq("code", inviteCode)
        .single()
        .then(({ data }) => {
          if (data && !data.used_by && new Date(data.expires_at) > new Date()) {
            setValidInvite(true);
          }
          setChecking(false);
        });
    } else {
      setChecking(false);
    }
  }, [inviteCode]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validInvite) {
      setError("邀请码无效或已过期");
      return;
    }
    setLoading(true);
    setError("");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      await supabase
        .from("invites")
        .update({ used_by: authData.user.id, used_at: new Date().toISOString() })
        .eq("code", inviteCode);

      router.push("/admin");
      router.refresh();
    }
  };

  if (checking) {
    return <p className="text-center text-cream-500 py-8">验证邀请码中...</p>;
  }

  if (!inviteCode) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-cream-950 mb-4">需要邀请码</h1>
        <p className="text-cream-800 mb-4">注册需要使用邀请码，请联系管理员获取。</p>
        <Link href="/login" className="text-cream-600 hover:text-cream-700">
          返回登录
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-cream-950 mb-6 text-center">注册</h1>
      {!validInvite && !checking && (
        <p className="text-center text-red-500 text-sm mb-4">邀请码无效或已过期</p>
      )}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm text-cream-800 mb-1">昵称</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:border-cream-400 bg-cream-50"
            placeholder="你的昵称"
          />
        </div>
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
            minLength={6}
            className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:border-cream-400 bg-cream-50"
            placeholder="至少6位"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !validInvite}
          className="w-full py-2 bg-cream-500 text-white rounded-lg hover:bg-cream-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-cream-500">
        已有账号？{" "}
        <Link href="/login" className="text-cream-600 hover:text-cream-700 font-medium">
          登录
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-8">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-cream-200">
        <Suspense fallback={<p className="text-center text-cream-500 py-8">加载中...</p>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}

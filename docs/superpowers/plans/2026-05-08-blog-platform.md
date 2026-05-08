# Blog Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-user life-record blog platform with invite-only registration, split Markdown editor, and warm cream scrapbook visual design.

**Architecture:** Next.js App Router with Supabase handling Auth, database, and storage. Public pages (homepage, article detail) use static generation via `generateStaticParams`. Admin routes are protected by Supabase Auth middleware. Markdown content is stored in PostgreSQL and rendered client-side with `react-markdown`.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4, Supabase (Auth + PostgreSQL + Storage), react-markdown, remark-gfm, Vercel deployment

---

## File Structure

```
/Users/czc/Desktop/claude/
├── .env.local
├── .env.example
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                          # Homepage (SSG)
│   ├── login/
│   │   └── page.tsx                      # Login
│   ├── register/
│   │   └── page.tsx                      # Register with invite code
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx                  # Article detail (SSG)
│   ├── admin/
│   │   ├── layout.tsx                    # Admin layout (auth guard)
│   │   ├── page.tsx                      # Dashboard with tabs
│   │   ├── new/
│   │   │   └── page.tsx                  # New article editor
│   │   ├── edit/
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Edit article
│   │   └── invite/
│   │       └── page.tsx                  # Invite management
│   └── api/
│       └── auth/
│           └── callback/
│               └── route.ts              # Supabase auth callback
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser client
│   │   ├── server.ts                     # Server client
│   │   └── admin.ts                      # Service-role client
│   └── utils.ts                          # slugify, helpers
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PostCard.tsx                      # Article card for listing
│   ├── PostList.tsx                      # Article list container
│   ├── FeaturedCard.tsx                  # Large featured card
│   ├── LetterHeader.tsx                  # Salutation + date + weather
│   ├── LetterFooter.tsx                  # Signature + interactions
│   ├── MarkdownEditor.tsx                # Left panel
│   ├── MarkdownPreview.tsx               # Right panel
│   ├── TabBar.tsx                        # Articles/Drafts/Members
│   ├── MemberList.tsx
│   ├── InviteCodeList.tsx
│   └── AuthGuard.tsx                     # Client-side auth wrapper
└── supabase/
    └── migrations/
        └── 001_initial.sql
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`

- [ ] **Step 1: Create Next.js project**

Run:
```bash
cd /Users/czc/Desktop/claude && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --no-turbopack
```
Expected: Scaffolds Next.js 15 project with TypeScript, Tailwind, ESLint, App Router

- [ ] **Step 2: Install additional dependencies**

Run:
```bash
cd /Users/czc/Desktop/claude && npm install @supabase/supabase-js @supabase/ssr react-markdown remark-gfm
```
Expected: All packages installed without errors

- [ ] **Step 3: Verify dev server starts**

Run:
```bash
cd /Users/czc/Desktop/claude && npm run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
Expected: `200`

- [ ] **Step 4: Stop dev server and commit**

Run:
```bash
kill $(lsof -t -i:3000) 2>/dev/null
cd /Users/czc/Desktop/claude && git add -A && git commit -m "chore: scaffold Next.js project with TypeScript and Tailwind

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Environment & Supabase Setup

**Files:**
- Create: `.env.local`, `.env.example`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create env files**

Write `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Write `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
```

(Real values will be filled after Supabase project creation)

- [ ] **Step 2: Create Supabase browser client**

Write `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 3: Create Supabase server client**

Write `lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
```

Oops, that's a naming conflict with `createServerClient` from `@supabase/ssr`. Let me fix:

Write `lib/supabase/server.ts`:
```typescript
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
```

- [ ] **Step 4: Create Supabase admin client** (service role, server-only)

Write `lib/supabase/admin.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

- [ ] **Step 5: Create database migration**

Write `supabase/migrations/001_initial.sql`:
```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('admin', 'author')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  cover_image TEXT DEFAULT '',
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  weather TEXT DEFAULT '',
  mood TEXT DEFAULT '',
  location TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_by UUID REFERENCES public.profiles(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    'author'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can manage their own posts"
  ON public.posts FOR ALL
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- RLS: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS: invites
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invites"
  ON public.invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read invites by code"
  ON public.invites FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_invites_code ON public.invites(code);
```

- [ ] **Step 6: Commit**

```bash
cd /Users/czc/Desktop/claude && git add -A && git commit -m "feat: add Supabase clients, env config, and database migration

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Global Theme & Layout

**Files:**
- Create: `lib/utils.ts`
- Modify: `app/globals.css`
- Create: `components/Header.tsx`, `components/Footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create utility functions**

Write `lib/utils.ts`:
```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
```

- [ ] **Step 2: Write global CSS with warm cream theme**

Overwrite `app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-cream-50: #fef9f0;
  --color-cream-100: #fdf2e3;
  --color-cream-200: #f0e6da;
  --color-cream-300: #e8d5c4;
  --color-cream-400: #e8c4a2;
  --color-cream-500: #c4956a;
  --color-cream-600: #b8875c;
  --color-cream-700: #a67b5b;
  --color-cream-800: #8b6f5e;
  --color-cream-900: #5c4033;
  --color-cream-950: #3d2b1f;

  --font-serif: Georgia, "Times New Roman", serif;
}

body {
  background: linear-gradient(135deg, var(--color-cream-50), var(--color-cream-100));
  min-height: 100vh;
  color: var(--color-cream-950);
}
```

- [ ] **Step 3: Write Header component**

Write `components/Header.tsx`:
```tsx
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
```

- [ ] **Step 4: Write Footer component**

Write `components/Footer.tsx`:
```tsx
export default function Footer() {
  return (
    <footer className="border-t border-cream-200 py-6 mt-16">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-cream-500">
        <p>我们的生活剪贴簿 · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Update root layout**

Overwrite `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "我们的剪贴簿",
  description: "记录生活的美好瞬间",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main className="min-h-[calc(100vh-120px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify layout visually**

Run:
```bash
cd /Users/czc/Desktop/claude && npm run dev &
sleep 5
```
Expected: Dev server starts at http://localhost:3000 with header and footer visible

- [ ] **Step 7: Stop dev server and commit**

```bash
kill $(lsof -t -i:3000) 2>/dev/null
cd /Users/czc/Desktop/claude && git add -A && git commit -m "feat: add global layout with warm cream theme, header, and footer

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Auth Flow (Login, Register, Callback)

**Files:**
- Create: `app/login/page.tsx`, `app/register/page.tsx`, `app/api/auth/callback/route.ts`
- Create: `components/AuthGuard.tsx`

- [ ] **Step 1: Write auth callback route**

Write `app/api/auth/callback/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await getServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

- [ ] **Step 2: Write login page**

Write `app/login/page.tsx`:
```tsx
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
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
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
```

- [ ] **Step 3: Write register page**

Write `app/register/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validInvite, setValidInvite] = useState(false);
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
        });
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
      options: {
        data: { display_name: displayName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Mark invite as used
      await supabase
        .from("invites")
        .update({ used_by: authData.user.id, used_at: new Date().toISOString() })
        .eq("code", inviteCode);

      router.push("/admin");
      router.refresh();
    }
  };

  if (!inviteCode) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-cream-200">
          <h1 className="text-2xl font-bold text-cream-950 mb-4">需要邀请码</h1>
          <p className="text-cream-800 mb-4">注册需要使用邀请码，请联系管理员获取。</p>
          <Link href="/login" className="text-cream-600 hover:text-cream-700">
            返回登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-cream-200">
        <h1 className="text-2xl font-bold text-cream-950 mb-6 text-center">注册</h1>
        {!validInvite && (
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
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write AuthGuard component**

Write `components/AuthGuard.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setAuthed(true);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-cream-500">加载中...</p>
      </div>
    );
  }

  if (!authed) return null;
  return <>{children}</>;
}
```

- [ ] **Step 5: Create admin layout with auth guard**

Write `app/admin/layout.tsx`:
```tsx
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/czc/Desktop/claude && git add -A && git commit -m "feat: add auth flow with login, invite-based registration, and admin guard

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Homepage — Scrapbook Style

**Files:**
- Create: `components/PostCard.tsx`, `components/PostList.tsx`, `components/FeaturedCard.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write PostCard component**

Write `components/PostCard.tsx`:
```tsx
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
}

export default function PostCard({ post }: { post: Post }) {
  const emoji =
    post.cover_image ||
    (post.weather ? { "晴": "☀️", "雨": "🌧️", "阴": "☁️", "雪": "❄️" }[post.weather] || "📝" : "📝");

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block bg-white rounded-lg p-4 border border-cream-200 hover:border-cream-300 transition-colors relative"
    >
      {/* Simulated tape */}
      <div className="absolute -top-2 right-4 w-8 h-3 bg-cream-400/60 rounded-sm rotate-3" />
      <div className="flex gap-3 items-start">
        <div className="w-12 h-12 bg-gradient-to-br from-cream-300 to-cream-400 rounded-md flex items-center justify-center text-xl flex-shrink-0">
          {emoji}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-cream-950 text-sm truncate">{post.title}</h3>
          <p className="text-xs text-cream-500 mt-0.5">
            {post.profiles.display_name} · {formatDate(post.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Write FeaturedCard component**

Write `components/FeaturedCard.tsx`:
```tsx
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
  mood: string;
  location: string;
}

export default function FeaturedCard({ post }: { post: Post }) {
  const weatherEmoji = post.weather ? { "晴": "☀️", "雨": "🌧️", "阴": "☁️", "雪": "❄️" }[post.weather] || "" : "";
  const moodEmoji = post.mood || "💭";

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block bg-white rounded-xl p-6 border-2 border-dashed border-cream-300 hover:border-cream-400 transition-colors relative"
    >
      {/* Simulated tape */}
      <div className="absolute -top-3 left-6 w-10 h-4 bg-cream-400/60 rounded-sm -rotate-3" />
      <div className="flex items-center gap-2 text-xs text-cream-500 mb-2">
        <span>📌 精选</span>
        {weatherEmoji && <span>{weatherEmoji}</span>}
        {moodEmoji && <span>{moodEmoji}</span>}
      </div>
      <h2 className="text-lg font-bold text-cream-950 mb-2">{post.title}</h2>
      <p className="text-sm text-cream-700 mb-3 line-clamp-2">{post.excerpt}</p>
      {post.location && (
        <p className="text-xs text-cream-400 mb-2">📍 {post.location}</p>
      )}
      <div className="flex gap-2 mb-3">
        <div className="h-10 flex-1 bg-gradient-to-br from-green-200 to-green-300 rounded" />
        <div className="h-10 flex-1 bg-gradient-to-br from-orange-200 to-orange-300 rounded" />
        <div className="h-10 flex-1 bg-gradient-to-br from-blue-200 to-blue-300 rounded" />
      </div>
      <div className="text-xs text-cream-500">
        {post.profiles.display_name} · {formatDate(post.created_at)}
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Write PostList component**

Write `components/PostList.tsx`:
```tsx
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
```

- [ ] **Step 4: Write homepage**

Overwrite `app/page.tsx`:
```tsx
import { getServerSupabase } from "@/lib/supabase/server";
import PostList from "@/components/PostList";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await getServerSupabase();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, cover_image, author_id, created_at, weather, mood, location, profiles!inner(display_name)")
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
```

- [ ] **Step 5: Commit**

```bash
cd /Users/czc/Desktop/claude && git add -A && git commit -m "feat: add scrapbook-style homepage with featured card and post list

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Article Detail Page — Letter Style

**Files:**
- Create: `components/LetterHeader.tsx`, `components/LetterFooter.tsx`
- Create: `app/posts/[slug]/page.tsx`

- [ ] **Step 1: Write LetterHeader component**

Write `components/LetterHeader.tsx`:
```tsx
import { formatDate } from "@/lib/utils";

interface Props {
  title: string;
  authorName: string;
  date: string;
  weather: string;
  mood: string;
  location: string;
}

const weatherMap: Record<string, string> = { "晴": "☀️", "雨": "🌧️", "阴": "☁️", "雪": "❄️" };

export default function LetterHeader({ title, authorName, date, weather, mood, location }: Props) {
  return (
    <div className="mb-8">
      <p className="text-sm text-cream-500 mb-2 font-sans">
        寄给：每一个热爱生活的你
      </p>
      <h1 className="text-2xl md:text-3xl font-serif italic text-cream-950 mb-3">{title}</h1>
      <div className="flex items-center gap-3 text-xs text-cream-500 font-sans pb-4 border-b border-dashed border-cream-200">
        <span>{authorName}</span>
        <span>·</span>
        <span>{formatDate(date)}</span>
        {weather && <span>{weatherMap[weather] || weather}</span>}
        {mood && <span>{mood}</span>}
        {location && <span>📍 {location}</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write LetterFooter component**

Write `components/LetterFooter.tsx`:
```tsx
interface Props {
  authorName: string;
}

export default function LetterFooter({ authorName }: Props) {
  return (
    <div className="mt-12 pt-6 border-t border-dashed border-cream-200">
      <p className="text-right font-serif italic text-cream-700 text-lg">你的朋友，{authorName}</p>
      <div className="flex items-center gap-4 mt-4 text-sm text-cream-500 font-sans justify-end">
        <button className="hover:text-cream-600 transition-colors">❤️ 喜欢</button>
        <button className="hover:text-cream-600 transition-colors">💬 评论</button>
        <button className="hover:text-cream-600 transition-colors">✉️ 分享</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write article detail page**

Write `app/posts/[slug]/page.tsx`:
```tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LetterHeader from "@/components/LetterHeader";
import LetterFooter from "@/components/LetterFooter";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published");

  return (data || []).map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
        {/* Stamp decoration */}
        <div className="absolute top-4 right-6 w-10 h-10 border-2 border-cream-300 rounded-full flex items-center justify-center text-[8px] text-cream-500 font-sans">
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <LetterFooter authorName={(post.profiles as any).display_name} />
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/czc/Desktop/claude && git add -A && git commit -m "feat: add letter-style article detail page with markdown rendering

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: Split Markdown Editor

**Files:**
- Create: `components/MarkdownEditor.tsx`, `components/MarkdownPreview.tsx`
- Create: `app/admin/new/page.tsx`, `app/admin/edit/[id]/page.tsx`

- [ ] **Step 1: Write MarkdownEditor component**

Write `components/MarkdownEditor.tsx`:
```tsx
"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    // Image upload handled later with Supabase Storage
    // For now, insert placeholder
    for (const file of files) {
      const placeholder = `\n![${file.name}](uploading...)\n`;
      onChange(value + placeholder);
    }
  };

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-full min-h-[500px] p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-cream-50/50"
      placeholder="# 标题

开始写你的故事..."
    />
  );
}
```

- [ ] **Step 2: Write MarkdownPreview component**

Write `components/MarkdownPreview.tsx`:
```tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export default function MarkdownPreview({ content }: Props) {
  return (
    <div className="p-4 prose prose-stone max-w-none font-serif text-cream-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "*在左边开始写作...*"}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 3: Write new article editor page**

Write `app/admin/new/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const save = async (status: "draft" | "published") => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const slug = slugify(title) || `post-${Date.now()}`;

    const { error } = await supabase.from("posts").insert({
      title,
      slug,
      content,
      excerpt: content.replace(/[#*`!\][]/g, "").substring(0, 150),
      author_id: userData.user.id,
      status,
      weather,
      mood,
      location,
    });

    if (!error) {
      router.push("/admin");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-cream-950">✏️ 写文章</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save("draft")}
            disabled={saving || !title}
            className="px-4 py-1.5 border border-cream-300 text-cream-700 rounded-full text-sm hover:bg-cream-100 disabled:opacity-50"
          >
            存草稿
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving || !title}
            className="px-4 py-1.5 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 disabled:opacity-50"
          >
            发布
          </button>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700"
        >
          <option value="">☀️ 天气</option>
          <option value="晴">☀️ 晴</option>
          <option value="雨">🌧️ 雨</option>
          <option value="阴">☁️ 阴</option>
          <option value="雪">❄️ 雪</option>
        </select>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700"
        >
          <option value="">💭 心情</option>
          <option value="😊">😊 开心</option>
          <option value="😌">😌 平静</option>
          <option value="🤔">🤔 思考</option>
          <option value="😢">😢 难过</option>
        </select>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="📍 地点"
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700 w-32"
        />
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="文章标题..."
        className="w-full text-xl font-bold text-cream-950 mb-4 px-2 py-1 border-0 border-b border-cream-200 focus:outline-none focus:border-cream-400 bg-transparent"
      />

      {/* Editor + Preview split */}
      <div className="grid grid-cols-2 gap-0 border border-cream-200 rounded-lg overflow-hidden bg-white min-h-[500px]">
        <MarkdownEditor value={content} onChange={setContent} />
        <div className="border-l border-cream-200 bg-white overflow-auto">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write edit page**

Write `app/admin/edit/[id]/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import { createClient } from "@/lib/supabase/client";

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [weather, setWeather] = useState("");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setWeather(data.weather || "");
          setMood(data.mood || "");
          setLocation(data.location || "");
          setStatus(data.status);
        }
        setLoading(false);
      });
  }, [id]);

  const save = async (newStatus: "draft" | "published") => {
    setSaving(true);
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        excerpt: content.replace(/[#*`!\][]/g, "").substring(0, 150),
        weather,
        mood,
        location,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error) {
      router.push("/admin");
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-cream-500">加载中...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-cream-950">✏️ 编辑文章</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="px-4 py-1.5 border border-cream-300 text-cream-700 rounded-full text-sm hover:bg-cream-100 disabled:opacity-50"
          >
            存草稿
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="px-4 py-1.5 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 disabled:opacity-50"
          >
            {status === "published" ? "更新" : "发布"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700"
        >
          <option value="">☀️ 天气</option>
          <option value="晴">☀️ 晴</option>
          <option value="雨">🌧️ 雨</option>
          <option value="阴">☁️ 阴</option>
          <option value="雪">❄️ 雪</option>
        </select>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700"
        >
          <option value="">💭 心情</option>
          <option value="😊">😊 开心</option>
          <option value="😌">😌 平静</option>
          <option value="🤔">🤔 思考</option>
          <option value="😢">😢 难过</option>
        </select>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="📍 地点"
          className="px-3 py-1 border border-cream-200 rounded-full text-xs bg-cream-50 text-cream-700 w-32"
        />
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="文章标题..."
        className="w-full text-xl font-bold text-cream-950 mb-4 px-2 py-1 border-0 border-b border-cream-200 focus:outline-none focus:border-cream-400 bg-transparent"
      />

      <div className="grid grid-cols-2 gap-0 border border-cream-200 rounded-lg overflow-hidden bg-white min-h-[500px]">
        <MarkdownEditor value={content} onChange={setContent} />
        <div className="border-l border-cream-200 bg-white overflow-auto">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/czc/Desktop/claude && git add -A && git commit -m "feat: add split Markdown editor with live preview for creating and editing posts

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: Admin Dashboard

**Files:**
- Create: `components/TabBar.tsx`, `components/MemberList.tsx`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Write TabBar component**

Write `components/TabBar.tsx`:
```tsx
"use client";

type Tab = "articles" | "drafts" | "members";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  draftCount: number;
}

export default function TabBar({ active, onChange, draftCount }: Props) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "articles", label: "文章" },
    { key: "drafts", label: `草稿 (${draftCount})` },
    { key: "members", label: "成员" },
  ];

  return (
    <div className="flex gap-1 bg-cream-100 rounded-full p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            active === tab.key
              ? "bg-cream-400 text-white"
              : "text-cream-700 hover:text-cream-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write MemberList component**

Write `components/MemberList.tsx`:
```tsx
interface Member {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

export default function MemberList({ members }: { members: Member[] }) {
  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-cream-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cream-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {m.display_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-cream-950">{m.display_name}</p>
              <p className="text-xs text-cream-500">{m.email}</p>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              m.role === "admin" ? "bg-cream-400 text-white" : "bg-cream-100 text-cream-600"
            }`}
          >
            {m.role === "admin" ? "管理员" : "作者"}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write admin dashboard page**

Write `app/admin/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import TabBar from "@/components/TabBar";
import MemberList from "@/components/MemberList";

type Tab = "articles" | "drafts" | "members";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [posts, setPosts] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }

      // Fetch published posts
      supabase
        .from("posts")
        .select("id, title, slug, status, created_at")
        .eq("author_id", data.user.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .then(({ data: p }) => setPosts(p || []));

      // Fetch drafts
      supabase
        .from("posts")
        .select("id, title, slug, status, updated_at")
        .eq("author_id", data.user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .then(({ data: d }) => setDrafts(d || []));

      // Fetch members
      supabase
        .from("profiles")
        .select("id, email, display_name, role, created_at")
        .order("created_at", { ascending: true })
        .then(({ data: m }) => setMembers(m || []));

      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("posts").delete().eq("id", id);
    setPosts((p) => p.filter((x) => x.id !== id));
    setDrafts((d) => d.filter((x) => x.id !== id));
  };

  if (loading) {
    return <div className="p-8 text-center text-cream-500">加载中...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-cream-950">📋 管理</h1>
        <Link
          href="/admin/new"
          className="px-4 py-1.5 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 transition-colors"
        >
          + 写新文章
        </Link>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} draftCount={drafts.length} />

      {activeTab === "articles" && (
        <div className="space-y-2">
          {posts.length === 0 && (
            <p className="text-center text-cream-500 py-8">还没有发布文章</p>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-cream-200"
            >
              <div>
                <p className="text-sm font-medium text-cream-950">{post.title}</p>
                <p className="text-xs text-cream-500">
                  {new Date(post.created_at).toLocaleDateString("zh-CN")} · 已发布
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <Link href={`/admin/edit/${post.id}`} className="text-cream-600 hover:text-cream-700">
                  编辑
                </Link>
                <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-500">
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "drafts" && (
        <div className="space-y-2">
          {drafts.length === 0 && (
            <p className="text-center text-cream-500 py-8">没有草稿</p>
          )}
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-cream-200"
            >
              <div>
                <p className="text-sm font-medium text-cream-700">{draft.title}</p>
                <p className="text-xs text-cream-400">
                  草稿 · 上次编辑 {new Date(draft.updated_at).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <Link href={`/admin/edit/${draft.id}`} className="text-cream-600 hover:text-cream-700">
                  继续写
                </Link>
                <button onClick={() => handleDelete(draft.id)} className="text-red-400 hover:text-red-500">
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "members" && (
        <div>
          <div className="flex justify-end mb-4">
            <Link
              href="/admin/invite"
              className="px-4 py-1.5 border border-cream-300 text-cream-700 rounded-full text-sm hover:bg-cream-100"
            >
              ✉️ 邀请成员
            </Link>
          </div>
          <MemberList members={members} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/czc/Desktop/claude && git add -A && git commit -m "feat: add admin dashboard with article/draft/member management tabs

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 9: Invite System

**Files:**
- Create: `components/InviteCodeList.tsx`
- Create: `app/admin/invite/page.tsx`

- [ ] **Step 1: Write InviteCodeList component**

Write `components/InviteCodeList.tsx`:
```tsx
"use client";

import { useState } from "react";

interface Invite {
  id: string;
  code: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

interface Props {
  invites: Invite[];
  onGenerate: () => Promise<void>;
}

export default function InviteCodeList({ invites, onGenerate }: Props) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await onGenerate();
    setGenerating(false);
  };

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/register?invite=${code}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-1.5 bg-cream-500 text-white rounded-full text-sm hover:bg-cream-600 disabled:opacity-50 transition-colors"
        >
          {generating ? "生成中..." : "+ 生成邀请码"}
        </button>
      </div>

      {invites.length === 0 && (
        <p className="text-center text-cream-500 py-8">还没有邀请码</p>
      )}

      <div className="space-y-3">
        {invites.map((inv) => (
          <div
            key={inv.id}
            className="p-4 bg-white rounded-lg border border-cream-200"
          >
            <div className="flex items-center justify-between mb-2">
              <code className="text-sm font-mono text-cream-600 bg-cream-50 px-2 py-0.5 rounded">
                {inv.code}
              </code>
              <span className={`text-xs px-2 py-0.5 rounded-full ${inv.used_by ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-600"}`}>
                {inv.used_by ? "已使用" : "可用"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-cream-500">
              <span>
                有效期至 {new Date(inv.expires_at).toLocaleDateString("zh-CN")}
              </span>
              {!inv.used_by && (
                <button
                  onClick={() => copyLink(inv.code)}
                  className="text-cream-600 hover:text-cream-700"
                >
                  复制链接
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write invite page**

Write `app/admin/invite/page.tsx`:
```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import InviteCodeList from "@/components/InviteCodeList";
import Link from "next/link";

export default function InvitePage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
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
        .then(({ data: inv }) => setInvites(inv || []));
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
```

- [ ] **Step 3: Commit**

```bash
cd /Users/czc/Desktop/claude && git add -A && git commit -m "feat: add invite system with code generation and copy-to-clipboard

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 10: Supabase Project & Deployment

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → Create new project → Save the project URL, anon key, and service role key to `.env.local`

- [ ] **Step 2: Run migration**

Go to Supabase SQL Editor → Paste content from `supabase/migrations/001_initial.sql` → Run

- [ ] **Step 3: Configure Auth in Supabase**

In Supabase Dashboard:
- Authentication → Providers → Enable "Email"
- Disable "Confirm email" (for simplicity during setup)
- Site URL: `http://localhost:3000` (dev) and production URL later

- [ ] **Step 4: Verify app works locally**

Run:
```bash
cd /Users/czc/Desktop/claude && npm run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
Expected: `200` from homepage

- [ ] **Step 5: Create first admin user**

Register via `/register?invite=<first-code>` in browser. Then manually set role in Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

- [ ] **Step 6: Deploy to Vercel**

```bash
cd /Users/czc/Desktop/claude
```

Then go to https://vercel.com → Import Git Repository → Select the repo → Add environment variables from `.env.local` → Deploy

After deployment, update Supabase Auth Site URL to the Vercel domain.

- [ ] **Step 7: Commit any final changes**

```bash
kill $(lsof -t -i:3000) 2>/dev/null
cd /Users/czc/Desktop/claude && git add -A && git commit -m "chore: finalize deployment configuration

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

# Blog Platform Design

## Overview

多人协作文档生活记录博客平台。管理员邀请成员加入，成员通过在线 Markdown 分屏编辑器写作和发布文章。

## Tech Stack

- **Frontend**: Next.js App Router (React 19)
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel (免费)
- **Editor**: 分屏 Markdown 编辑器 (左侧编辑，右侧实时预览)

## Visual Design

- **风格**: 温暖奶油 — 暖色渐变背景 (#fef9f0 → #fdf2e3)，棕色系文字，亲切舒适
- **首页**: 手工剪贴簿风格 — 胶带、便签装饰元素，左侧精选大卡片 + 右侧文章列表
- **文章页**: 书信体 — 衬线字体，书信格式，开头称谓 + 结尾署名
- **字体**: 正文 system-ui，书信页 Georgia 衬线字体

## Pages & Routes

| 路由 | 页面 | 权限 |
|------|------|------|
| `/` | 首页 — 剪贴簿风格文章列表 | 公开 |
| `/posts/[slug]` | 文章详情 — 书信体展示 | 公开 |
| `/login` | 登录页 | 未登录 |
| `/admin` | 后台管理 — 单页 Tab 切换 (文章/草稿/成员) | 已登录 |
| `/admin/new` | 写文章 — 分屏 Markdown 编辑器 | 已登录 |
| `/admin/edit/[id]` | 编辑已有文章 | 已登录 |
| `/admin/invite` | 邀请成员页面 | 管理员 |
| `/api/auth/callback` | Supabase Auth 回调 | 自动 |

## Data Model

```
users (Supabase Auth 管理):
  id, email, role (admin/author), display_name, avatar_url, created_at

posts:
  id, title, slug, content (Markdown), excerpt, cover_image,
  author_id → users.id, status (draft/published),
  weather, mood, location,  -- 生活记录标签
  created_at, updated_at

invites:
  id, code, created_by → users.id, used_by → users.id (nullable),
  used_at, expires_at, created_at
```

## Key Features

1. **邀请制注册**: 管理员生成邀请码，受邀者凭码注册
2. **Markdown 分屏编辑**: 左写右预览，支持图片拖入
3. **生活标签**: 每篇文章可标注天气、心情、地点
4. **静态生成**: 公开页面全部 SSG，加载极快
5. **Supabase Auth**: 邮箱密码登录，无需自建认证系统

## Component Tree

```
Layout
├── Header (Logo + 导航 + 登录状态)
├── Main
│   ├── HomePage
│   │   ├── FeaturedCard (精选大卡片)
│   │   └── PostList (文章列表)
│   ├── PostPage
│   │   ├── LetterHeader (称谓 + 日期 + 天气)
│   │   ├── MarkdownContent (渲染内容)
│   │   └── LetterFooter (署名 + 互动)
│   ├── LoginPage
│   ├── AdminPage
│   │   ├── TabBar (文章/草稿/成员)
│   │   ├── PostList (带缩略图)
│   │   └── MemberList
│   ├── EditorPage
│   │   ├── MarkdownEditor (左侧编辑)
│   │   └── MarkdownPreview (右侧预览)
│   └── InvitePage
│       ├── InviteCodeList
│       └── GenerateButton
└── Footer
```

## User Flows

### 邀请成员

1. 管理员访问 `/admin` → 切换到「成员」Tab → 点击「邀请」
2. 系统生成唯一邀请码，可复制链接发给朋友
3. 朋友通过链接访问 `/register?invite=xxx`
4. 填写邮箱和密码完成注册，自动成为 author 角色
5. 注册后可直接登录，进入后台写作

### 写作发布

1. 登录后进入 `/admin`，点击「写新文章」
2. 进入 `/admin/new`，分屏 Markdown 编辑器
3. 左侧写 Markdown，右侧实时预览
4. 可拖入图片、设置天气/心情/地点标签
5. 发布前可保存草稿，发布后文章出现在首页

### 权限说明

| 操作 | 管理员 | 作者 |
|------|--------|------|
| 写文章 | ✅ | ✅ |
| 编辑自己的文章 | ✅ | ✅ |
| 删除自己的文章 | ✅ | ✅ |
| 发布文章 | ✅ | ✅ |
| 邀请新成员 | ✅ | ❌ |
| 删除任意文章 | ✅ | ❌ |

## Supabase Setup

- **Auth**: Email + Password provider
- **Storage**: 文章图片存储
- **Database**: posts, invites 表
- **RLS**: 已发布文章公开可读，草稿仅作者可见

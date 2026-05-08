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
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    await onGenerate();
    setGenerating(false);
  };

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/register?invite=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
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

      {invites.length === 0 && <p className="text-center text-cream-500 py-8">还没有邀请码</p>}

      <div className="space-y-3">
        {invites.map((inv) => (
          <div key={inv.id} className="p-4 bg-white rounded-lg border border-cream-200">
            <div className="flex items-center justify-between mb-2">
              <code className="text-sm font-mono text-cream-600 bg-cream-50 px-2 py-0.5 rounded">
                {inv.code}
              </code>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  inv.used_by ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-600"
                }`}
              >
                {inv.used_by ? "已使用" : "可用"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-cream-500">
              <span>有效期至 {new Date(inv.expires_at).toLocaleDateString("zh-CN")}</span>
              {!inv.used_by && (
                <button
                  onClick={() => copyLink(inv.code)}
                  className="text-cream-600 hover:text-cream-700"
                >
                  {copied === inv.code ? "已复制!" : "复制链接"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

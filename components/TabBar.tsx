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

"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
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

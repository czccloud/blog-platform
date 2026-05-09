"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      const placeholder = `\n![${file.name}](uploading...)\n`;
      const pos = value + placeholder;
      onChange(pos);

      try {
        const url = await uploadImage(file);
        onChange(pos.replace(`![${file.name}](uploading...)`, `![${file.name}](${url})`));
      } catch {
        onChange(pos.replace(`![${file.name}](uploading...)`, `![${file.name}](上传失败)`));
      }
    }

    setUploading(false);
  };

  return (
    <div className="relative h-full">
      {uploading && (
        <div className="absolute top-2 right-2 bg-cream-400 text-white text-xs px-2 py-1 rounded-full z-10">
          上传中...
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full h-full min-h-[500px] p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-cream-50/50"
        placeholder="# 标题

开始写你的故事..."
      />
    </div>
  );
}

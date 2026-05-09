"use client";

import { useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const uploadAndInsert = async (file: File) => {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Insert placeholder at cursor
    const placeholder = `![${file.name}](uploading...)`;
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = before + "\n" + placeholder + "\n" + after;
    onChange(newValue);

    // Upload
    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file);

    if (error) {
      onChange(newValue.replace(placeholder, `![${file.name}](上传失败: ${error.message})`));
      return;
    }

    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(data.path);

    onChange(newValue.replace(placeholder, `![${file.name}](${urlData.publicUrl})`));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    files.forEach(uploadAndInsert);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items).filter((i) => i.type.startsWith("image/"));
    items.forEach((item) => {
      const file = item.getAsFile();
      if (file) uploadAndInsert(file);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadAndInsert);
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-cream-200 bg-cream-50/80">
        <label className="cursor-pointer text-xs text-cream-500 hover:text-cream-700 flex items-center gap-1">
          🖼️ 插入图片
          <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
        </label>
        <span className="text-cream-300 text-xs">|</span>
        <span className="text-xs text-cream-400">支持拖入或粘贴图片</span>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
        className="flex-1 p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-transparent"
        placeholder="# 标题

开始写你的故事...
拖入或粘贴图片到编辑器"
      />
    </div>
  );
}

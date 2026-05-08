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

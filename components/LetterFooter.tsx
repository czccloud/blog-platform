interface Props {
  authorName: string;
}

export default function LetterFooter({ authorName }: Props) {
  return (
    <div className="mt-12 pt-6 border-t border-dashed border-cream-200">
      <p className="text-right font-serif italic text-cream-700 text-lg">你的朋友，{authorName}</p>
      <div className="flex items-center gap-4 mt-4 text-sm text-cream-500 justify-end">
        <button className="hover:text-cream-600 transition-colors">❤️ 喜欢</button>
        <button className="hover:text-cream-600 transition-colors">💬 评论</button>
        <button className="hover:text-cream-600 transition-colors">✉️ 分享</button>
      </div>
    </div>
  );
}

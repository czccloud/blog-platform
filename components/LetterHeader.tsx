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
      <p className="text-sm text-cream-500 mb-2">寄给：每一个热爱生活的你</p>
      <h1 className="text-2xl md:text-3xl font-serif italic text-cream-950 mb-3">{title}</h1>
      <div className="flex items-center gap-3 text-xs text-cream-500 pb-4 border-b border-dashed border-cream-200">
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

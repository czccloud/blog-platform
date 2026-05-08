export default function Footer() {
  return (
    <footer className="border-t border-cream-200 py-6 mt-16">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-cream-500">
        <p>我们的生活剪贴簿 · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

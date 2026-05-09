export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function cleanExcerpt(markdown: string): string {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, "")   // 去掉图片
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // 链接保留文字
    .replace(/[#*`>|~]/g, "")          // 去掉 markdown 符号
    .replace(/\n+/g, " ")              // 换行变空格
    .trim()
    .substring(0, 200);
}

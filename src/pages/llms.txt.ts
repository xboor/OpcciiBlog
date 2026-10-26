import { getCollection } from "astro:content";
import { getPostUrl } from "@/utils/getPostPaths";
import { getSortedPosts } from "@/utils/getSortedPosts";
import config from "@/config";

import type { APIRoute } from "astro";

/**
 * llms.txt（https://llmstxt.org/ 约定）：给 AI Agent 的站点阅读指南。
 * 列出全部文章的 HTML 与 Markdown 原文地址。
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(config.site.url)).origin.replace(/\/+$/, "");
  const posts = getSortedPosts(await getCollection("posts"));

  const lines = [
    `# ${config.site.title}`,
    "",
    `> ${config.site.description}`,
    "",
    `个人博客，文章以简体中文撰写，基于 Astro 静态生成。`,
    "",
    "AI Agent 阅读指南：",
    "",
    `- 文章 HTML 地址形如 ${origin}/posts/<slug>/`,
    `- 每篇文章的 Markdown 原文位于 ${origin}/posts/<slug>/index.md（HTML 地址 + index.md）`,
    `- 全部页面 URL 见 sitemap：${origin}/sitemap-index.xml`,
    `- 文章订阅：${origin}/rss.xml`,
    `- 中国大陆访问缓慢时，可使用备用镜像站 https://backup.opccii.com（路径结构相同）`,
    "",
    "## 文章",
    "",
    ...posts.map(post => {
      const htmlUrl = `${origin}${getPostUrl(post.id, post.filePath)}`;
      const rawUrl = `${htmlUrl.replace(/\/+$/, "")}/index.md`;
      const desc = post.data.description ? `: ${post.data.description}` : "";
      return `- [${post.data.title}](${rawUrl})${desc}（HTML: ${htmlUrl}）`;
    }),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

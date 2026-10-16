import type { APIRoute } from "astro";
import { PUBLIC_DEPLOY_TARGET } from "astro:env/client";

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  // 备用站（Azure）不生成 sitemap，避免与主域（Cloudflare）重复收录。
  // canonical 已在 Layout 中恒定指向主域名，备用站仍可被抓取（不 noindex）。
  if (PUBLIC_DEPLOY_TARGET === "backup") {
    return new Response(`User-agent: *
Allow: /
`);
  }

  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};

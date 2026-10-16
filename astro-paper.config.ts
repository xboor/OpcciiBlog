import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // 主域名（Cloudflare）。这里是全站 canonical / RSS / sitemap 的唯一来源，
    // 备用站（Azure，backup.opccii.com）部署时 canonical 仍指向该域名。
    url: "https://opccii.com/",
    title: "Opccii 的博客",
    description: "记录技术、数学与生活的个人博客。",
    author: "Opccii",
    profile: "",
    ogImage: "default-og.jpg",
    // 默认语言：中文（英文 UI 文案保留在 src/i18n/lang/en.ts，后续启用英文写作时可用）。
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 6,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    // 关闭动态 OG 图：内置生成器只用拉丁字体，中文标题会变豆腐块。
    // 改为使用 public/default-og.jpg，文章也可用 ogImage 字段指定第三方图床 URL。
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/xboor/OpcciiBlog/edit/main/",
    },
    search: "pagefind",
  },
  // 社交链接（可选）。name 必须对应 src/assets/icons/socials/ 下的 svg 文件名。
  socials: [{ name: "github", url: "https://github.com/xboor" }],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});

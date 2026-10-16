# 技术决策记录（ADR）

> 项目版本：v1.1

本文件记录本项目已定型的决策与理由，避免后续反复讨论或误改。

---

## 1. 内容格式：MDX，移除 Markdoc

**决策**：文章用 `.mdx`，删除 `@astrojs/markdoc`。
**理由**：MDX 允许在正文中直接 import 组件（本项目用它引入 `SmartImage`），并且复用
`markdown.processor` 里已挂载的 remark/rehype 插件链，数学公式无需二次配置。

---

## 2. 输出模式：纯静态，移除 Node 适配器

**决策**：`output: 'static'`（Astro 默认），删除 `@astrojs/node` 与 `output: 'server'`。
**理由**：博客没有服务端逻辑，静态产物可直接托管到 Cloudflare Pages / Azure SWA，
成本为零、可用性最高。Keystatic 改为仅 dev 挂载，不破坏静态输出。

---

## 3. 主题：AstroPaper（内化为源码）

**决策**：采用 AstroPaper，并把 `src/` 等目录整体搬进本项目，而非作为依赖。
**理由**：MIT 协议、Star 数高、内容型博客的默认结构完善（标签/归档/RSS/搜索/暗色模式）。
内化为源码后可以自由改造（中文文案、数学公式、图片兜底、评论区）。
**注意**：拉取时使用的分支为 `main`（对应 Astro 7）；发布的 v6 tag 面向 Astro 6，与本项目不兼容。

---

## 4. 语言：默认中文，保留英文

**决策**：`i18n.locales: ["zh", "en"]`，`defaultLocale: "zh"`，`prefixDefaultLocale: false`。
**理由**：当前只写中文，因此默认语言下 URL 不带 `/zh/` 前缀；英文 UI 文案
（`src/i18n/lang/en.ts`）原样保留，将来开启英文写作时无需重构。

---

## 5. 图床：清单 + 客户端兜底链

**决策**：正文只引用 `src/data/images.json` 里的 key，由 `SmartImage` 输出
`primary` 与 `data-fallback-chain`；图片加载失败时客户端按顺序切换到备用图床。
**未采用**：Cloudflare R2（对象存储）与 CF Worker 反代。
**理由**：完全靠第三方免费图床即可满足需求，无需额外维护存储与中转服务；
切换备用链接只需改 JSON，不改正文。

---

## 6. 评论：giscus（不额外加验证码）

**决策**：使用 giscus（基于 GitHub Discussions），仓库必须为 public。
**理由**：免费、无后端、自带反滥用（发评论需 GitHub 登录），因此不再单独做验证码。
**备选被否**：用户明确接受了「无验证码、GitHub 登录准入」这一前提。

---

## 7. 统计：Cloudflare Web Analytics，不用 partytown / 不默认 GA

**决策**：仅接入 CF Web Analytics beacon，且**只在主站**输出。
**理由**：隐私友好、无需 cookie 横幅、脚本体积极小。partytown
对单个 beacon 的收益不足以抵消其复杂度与调试成本。

---

## 8. SEO：主站收录，备用站 canonical 指向主域

**决策**：
- `site.url` 恒定主域名（canonical、RSS、sitemap 的唯一来源）
- 备用站**不生成 sitemap**，`robots.txt` 也不指向 sitemap
- 备用站**不做 `noindex`**，仅靠 canonical 归并权重

**理由**：备站存在的意义是「主站不可用时的可访问兜底」，因此必须可被访问与抓取；
canonical 指向主域足以避免重复内容抢排名，比 noindex 更稳健。

---

## 9. 部署：双平台自动构建，本地预览

**决策**：push 到 `main` → Cloudflare Pages（主域）与 Azure SWA（备域）同时自动构建。
本地预览一律用 `astro preview`，不搭建云端预览环境。
**理由**：平台原生 Git 集成即可实现，无需额外的 CI 配置；本地预览更快且省额度。

---

## 10. Keystatic：仅本地写作

**决策**：保留 Keystatic，`storage.kind: 'local'`，仅在 `NODE_ENV=development` 时挂载。
**理由**：可视化后台对写作有实际帮助，且不进入生产构建。
**关键约束**：绝不设置 `format.contentField`，否则正文会被写入 frontmatter，
导致 AstroPaper 读到的正文为空。若将来 Keystatic 与主题冲突到无法调和，
经用户授权可直接删除，退化为纯 Markdown/MDX 写作（不依赖任何后台）。

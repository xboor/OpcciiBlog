# 架构说明

> 项目版本：v1.1

## 1. 技术栈

| 项 | 选择 | 说明 |
| --- | --- | --- |
| 框架 | Astro 7 | **`output: static`**（默认值，未显式声明），无服务端运行时 |
| 主题 | AstroPaper | MIT，已内化为本项目源码；上游分支 `main`（对应 Astro 7） |
| 内容 | MDX | `@astrojs/mdx`；插件链挂在 `markdown.processor` |
| 数学 | remark-math + rehype-katex | 全局生效，MDX 自动继承 |
| 高亮 | Shiki | `@shikijs/transformers`，双主题 |
| 样式 | Tailwind CSS v4 | 通过 `@tailwindcss/vite`，无 `tailwind.config.js` |
| 搜索 | Pagefind | 纯静态索引，无后端 |
| 评论 | giscus | GitHub Discussions |
| 统计 | Cloudflare Web Analytics | 仅主站 |
| CMS | Keystatic | **仅 dev 挂载** |
| i18n | 内置 i18n | 默认 `zh`，保留 `en`，默认语言不带 URL 前缀 |

**没有的东西**（不要去找）：服务端渲染、数据库、API 路由、Node 适配器、partytown、GA、
satori（动态 OG 图已移除）、Web 字体。

---

## 2. 关键配置文件

| 文件 | 作用 |
| --- | --- |
| `astro.config.ts` | 集成、i18n、markdown processor、Shiki、env schema、vite 插件 |
| `astro-paper.config.ts` | 站点信息（域名/标题/语言/功能开关/社交链接） |
| `src/config.ts` | 把 `astro-paper.config.ts` 与环境变量合并为运行时配置 |
| `src/content.config.ts` | 内容集合 schema（posts / pages） |
| `keystatic.config.ts` | 本地后台字段定义（**必须与 content.config.ts 对齐**） |
| `.env` | 环境变量（构建期注入），模板见 `.env.example` |
| `public/staticwebapp.config.json` | Azure SWA 的 404 回退与安全响应头 |

---

## 3. 目录结构

```
src/
  config.ts                  # 配置合并（astro-paper.config.ts + env）
  content.config.ts          # 集合 schema
  content/
    posts/                   # 文章（.mdx），_ 开头的文件被忽略
    pages/                   # 固定页面（about.md）
  data/
    images.json              # 图床清单：key → { primary, fallbacks }
  i18n/
    index.ts                 # 语言解析、日期格式化入口
    format.ts
    types.ts                 # UIStrings 类型
    lang/zh.ts | en.ts       # UI 文案
  layouts/
    Layout.astro             # HTML 骨架、meta/OG/canonical、统计、主题脚本
    PostLayout.astro         # 文章页布局（注入 JSON-LD、article meta）
  components/
    SmartImage.astro         # 图片组件 + 图床兜底链脚本
    Giscus.astro             # 评论区 + 暗色联动
    Header/Footer/Card/Main/Pagination/Tag/Datetime/Socials/Breadcrumb...
  pages/                     # 路由（见第 4 节）
  scripts/
    theme.ts                 # 亮/暗色切换（改写 <html data-theme>）
  styles/
    global.css               # 入口：引入 tailwind、theme、typography、katex
    theme.css                # 颜色变量、字体栈
    typography.css
  types/config.ts            # 配置类型
  utils/
    getSortedPosts.ts | postFilter.ts      # 排序与过滤（草稿/定时）
    getPostPaths.ts | getUniqueTags.ts
    resolveImage.ts                         # 读 images.json
    withBase.ts                             # base 路径处理
    transformers/fileName.js                # 代码块文件名
```

根目录另有：`scripts/copy-pagefind.mjs`（构建后复制搜索索引）、`docs/decisions.md`（决策记录）。

---

## 4. 路由表

| URL | 生成文件 |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/posts/`、`/posts/2/`… | `src/pages/posts/[...page].astro` |
| `/posts/<slug>/` | `src/pages/posts/[...slug]/index.astro` |
| `/posts/<slug>/index.md` | `src/pages/posts/[...slug]/index.md.ts`（Markdown 原文，供 AI Agent） |
| `/llms.txt` | `src/pages/llms.txt.ts`（AI Agent 站点阅读指南） |
| `/tags/` | `src/pages/tags/index.astro` |
| `/tags/<tag>/` | `src/pages/tags/[tag]/[...page].astro` |
| `/archives/` | `src/pages/archives/index.astro` |
| `/about/` | `src/pages/about.astro`（内容来自 `content/pages/about.md`） |
| `/search/` | `src/pages/search.astro` |
| `/rss.xml` | `src/pages/rss.xml.ts` |
| `/robots.txt` | `src/pages/robots.txt.ts` |
| `/sitemap-index.xml` | `@astrojs/sitemap`（**备用站不生成**） |
| `404.html` | `src/pages/404.astro` |

文章页的私有子组件放在同目录的 `_components/` 下（`_` 前缀目录不会被当成路由）。

---

## 5. 内容管线

```
src/content/posts/*.mdx
  ↓ Astro content collections（glob loader + zod schema）
  ↓ MDX 编译 → markdown.processor 的 remark/rehype 插件链
     （remark-math → remark-toc → remark-collapse → rehype-callouts → rehype-katex）
  ↓ Astro 静态渲染为 HTML（Shiki 高亮）
dist/
  ↓ pagefind --site dist 建索引 → 复制回 public/pagefind
  ↓ 部署：Cloudflare Pages（主站）/ Azure SWA（备站）
```

客户端脚本（均为渐进增强，禁用 JS 不影响内容可读）：

| 脚本 | 位置 | 作用 |
| --- | --- | --- |
| 主题切换 | `src/scripts/theme.ts` | 读写 `<html data-theme>`，FOUC 由 Layout 内联脚本预防 |
| giscus 挂载与配色同步 | `Giscus.astro` | 监听 `data-theme` 变化 postMessage 给 iframe |
| 图床兜底切换 | `SmartImage.astro` | 捕获阶段监听 `error`，按 `data-fallback-chain` 换源 |
| 代码复制 / 目录 / 图片灯箱 / 阅读进度 | 文章页内联脚本 | 见 `[...slug]/index.astro` |

---

## 6. 相对上游主题的改动

如果将来要合并上游更新，注意这些已经改过的地方：

1. 基线取自上游 **`main` 分支**（面向 Astro 7），不是发布的 v6 tag（面向 Astro 6）
2. **移除了动态 OG 图**：删除 `pages/og.png.ts`、`pages/posts/[...slug]/index.png.ts`、
   `utils/getFontPathByWeight.ts`，并关闭 `dynamicOgImage`
3. **字体改为系统字体栈**，移除 Layout 里的 `Font` 组件
4. **新增中文 UI 文案** `src/i18n/lang/zh.ts`，`i18n` 默认语言改为 `zh`
5. **新增** `components/SmartImage.astro`、`utils/resolveImage.ts`、`data/images.json`
6. **新增** `components/Giscus.astro`，并接入文章页
7. **新增** `keystatic.config.ts`（MDX 字段 + 对齐主题 schema）
8. **构建脚本**从 `cp -r` 改为 `node scripts/copy-pagefind.mjs`
9. 集成了 `@astrojs/react` 与 Keystatic，但**仅在 dev 生效**

---

## 7. 部署形态

星形架构，两条独立产线共用同一份源码：

```
GitHub (public)
   ├─ push → Cloudflare Pages（主域，PUBLIC_DEPLOY_TARGET=main）
   └─ push → Azure SWA（备域，PUBLIC_DEPLOY_TARGET=backup）
```

细节见 [deployment.md](./deployment.md)。

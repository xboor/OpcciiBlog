# 写作指南

> 项目版本：v1.1

本文件是**写文章时的唯一权威约定**。新增/修改文章前先读这里。

完全零基础请先看 [新手写作与发布完整指南](../docs/beginner-writing-guide.md)，其中包含环境安装、逐步练习、页面修改、Git 配置和发布排错。

---

## 1. 文件放哪、怎么命名

可直接复制 [文章模板](../src/content/posts/_post-template.mdx)，将副本改为不以下划线开头的英文文件名。
模板本身以 `_` 开头，不参与内容集合；副本默认 `draft: true`，预览和发布前需要调整。

- 目录：`src/content/posts/`
- 扩展名：**`.mdx`**（兼容 `.md`，但 MDX 才能用 `<SmartImage />` 等组件，统一用 `.mdx`）
- **文件名 = URL slug**。中文文件名会生成中文 URL（`/tags/随笔/` 这种虽然能用，但不推荐），
  所以**文件名用英文小写连字符**，如 `kubernetes-notes.mdx`
- 中文标题写在 frontmatter 的 `title` 字段，**不要**用它当文件名
- 以下划线开头的**文件名**会被集合 glob（`**/[^_]*.{md,mdx}`）忽略。
  不要依赖目录名前缀隔离草稿：该模式检查文件名，不保证排除整个 `_releases/` 目录。
  草稿应使用 `draft: true`，私密原稿不要推送到公开仓库。

---

## 2. frontmatter 字段

```yaml
---
title: "文章标题"                       # 必填
description: "摘要，用于 SEO 与列表展示"   # 必填
pubDatetime: 2026-10-17T09:00:00+08:00   # 必填，必须带时区偏移
tags: ["标签A", "标签B"]                  # 可选，默认 ["others"]
featured: false                          # 可选，true 会进首页「精选」
draft: false                             # 可选，true 则完全不显示
modDatetime: 2026-10-18T10:00:00+08:00   # 可选，更新时间
author: "博主"                            # 可选，默认取站点配置
ogImage: "https://..."                   # 可选，支持纯 URL（第三方图床）
canonicalURL: "https://..."              # 可选，转载文章指向原文
hideEditPost: false                      # 可选
timezone: "Asia/Shanghai"                # 可选，覆盖站点时区
---
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题 |
| `description` | 是 | 缺了会构建失败 |
| `pubDatetime` | 是 | 缺了会构建失败 |
| `tags` | 否 | 会生成标签页，标签名直接用中文即可 |
| `featured` | 否 | 首页精选位 |
| `draft` | 否 | 草稿隔离 |
| `modDatetime` | 否 | 显示「更新于」 |
| `ogImage` | 否 | 必须是完整 URL，或 `public/` 下的路径 |

### ⚠️ 定时发布陷阱

`pubDatetime` 若晚于「当前时间 + 15 分钟」，文章会被判定为**未到发布时间而不生成**，
表现为「写了却看不到」。本地测试/首次发布时，**把时间设成过去**。

开发模式会显示非草稿的未来文章，生产构建才按日期过滤；`draft: true` 在两种模式都隐藏。
纯静态网站不会到点自行更新，未来时间到达后仍需重新触发构建部署。

---

## 3. 数学公式

行内 `$E = mc^2$`，块级：

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2}\,\mathrm{d}x = \sqrt{\pi}
$$
```

- 插件（`remark-math` + `rehype-katex`）已挂在 `astro.config.ts` 的 `markdown.processor`
- **MDX 与 Markdown 都生效**，正文里无需任何额外操作
- **不要在 `mdx()` 集成里重复挂载**（会重复处理）
- KaTeX 样式已在 `src/styles/global.css` 中 `@import`

---

## 4. 图片

**不要**在正文里直接写图床 URL。统一走「清单 + 兜底链」：

```mdx
import SmartImage from "@/components/SmartImage.astro";

<SmartImage key="my-cover" alt="封面" width={1200} height={675} class="rounded-lg" />
```

然后在 `src/data/images.json` 登记：

```json
{
  "my-cover": {
    "primary": "https://imglink.cc/xxx.jpg",
    "fallbacks": [
      "https://s2.loli.net/xxx.jpg",
      "https://cdn.jsdelivr.net/gh/<user>/<repo>@main/images/xxx.jpg"
    ]
  }
}
```

规则：

- **key 不存在时构建直接报错**（防止坏图上线）
- 主地址加载失败 → 客户端按 `fallbacks` 顺序自动切换，即「一键切换备用图床」
- 换图床只需改 JSON，**不用动正文**
- 直接写 `<img src="...">` 也允许，但没有兜底链
- 文章封面另可用 frontmatter 的 `ogImage`（纯 URL）

---

## 5. 代码块

````markdown
```ts
const a = 1;
```
````

- 由 Shiki 高亮，支持亮/暗双主题（`min-light` / `night-owl`）
- 支持主题内置的三个 transformer 标记：
  - `// [!code highlight]` 高亮行
  - `// [!code word:foo]` 高亮词
  - `// [!code --]` / `// [!code ++]` diff 行
- 可给代码块加文件名（主题的 `transformerFileName`）：` ```ts title="a.ts" `
- 复制按钮由页面脚本自动注入

---

## 6. Callout（提示框）

用 GitHub 风格语法，渲染为彩色方块：

```markdown
> [!NOTE]
> 提示内容

> [!WARNING]
> 警告内容
```

支持 `NOTE` / `TIP` / `IMPORTANT` / `WARNING` / `CAUTION`，主题为 obsidian。

---

## 7. 标签约定

- `tags: ["中文标签"]` 直接写中文即可，会生成 `/tags/<slugified>/` 页面
- 不要人为制造大量同义标签；标签是聚合入口，不是关键词堆砌
- `tags` 省略时默认落到 `["others"]`

---

## 8. 写作语言

- **默认中文**（`defaultLocale: "zh"`，URL 不带 `/zh/` 前缀）
- 英文文案已保留在 `src/i18n/lang/en.ts`，将来写英文文章时无需重构
- UI 文案改 `src/i18n/lang/zh.ts`，不要直接硬编码在组件里

---

## 9. 发布流程

```bash
pnpm build      # 自检：类型检查 + 构建 + 搜索索引
pnpm preview    # 本地眼看一遍
git add . && git commit -m "post: xxx" && git push
```

push 后 Cloudflare Pages（主站）与 Azure SWA（备用站）**自动构建**，无需手动部署。
参见 [deployment.md](./deployment.md)。

---

## 10. 可视化后台（可选）

`pnpm dev` 后访问 <http://localhost:4321/keystatic>。后台字段定义在 `keystatic.config.ts`，
**它在 dev 下才挂载**，生产构建不引入。

后台与手写 `.mdx` 完全等价，可混用。改后台字段定义时注意
[constraints.md](./constraints.md) 第 1、2 条。

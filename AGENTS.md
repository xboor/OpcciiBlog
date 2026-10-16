# AGENTS.md

本项目是个人博客。**修改代码或写文章前请先读完本文件**，它会把你路由到对应的详细文档。

> 本文件是**唯一入口**。细节拆到 `AGENTS/` 目录，按需查阅，避免一次性塞满上下文。

---

## 1. 文档路由（先查这里）

| 你要做的事 | 读这个 |
| --- | --- |
| **写文章 / 改 frontmatter / 找图片怎么放** | [AGENTS/writing-guide.md](AGENTS/writing-guide.md) |
| **改代码前确认哪些事不能做** | [AGENTS/constraints.md](AGENTS/constraints.md) |
| 了解技术栈、目录结构、路由表、内容管线 | [AGENTS/architecture.md](AGENTS/architecture.md) |
| 配环境变量、部署到 CF / Azure、发布流程 | [AGENTS/deployment.md](AGENTS/deployment.md) |
| 构建失败、页面异常、评论区不显示 | [AGENTS/troubleshooting.md](AGENTS/troubleshooting.md) |
| 想知道「当初为什么这么定」 | [docs/decisions.md](docs/decisions.md) |

**改代码前必须先读 [constraints.md](AGENTS/constraints.md)。**

---

## 2. 项目速览

| 项 | 选择 |
| --- | --- |
| 框架 | Astro 7，**`output: static`**，无服务端运行时 |
| 主题 | AstroPaper（MIT），已内化为源码 |
| 写作 | MDX（`.mdx`）+ KaTeX 数学公式 + Shiki 高亮 |
| 搜索 | Pagefind 静态全文索引（无后端） |
| 评论 | giscus（GitHub Discussions，仓库需 public） |
| 统计 | Cloudflare Web Analytics（仅主站） |
| 语言 | 默认中文 `zh`，保留 `en`（URL 不带语言前缀） |
| CMS | Keystatic，**仅 dev 挂载**，不参与生产构建 |
| 部署 | GitHub → Cloudflare Pages（主站）+ Azure SWA（备用站） |

---

## 3. 常用命令

```bash
pnpm install      # 安装依赖
pnpm dev          # 本地开发 → http://localhost:4321/
pnpm build        # astro check → astro build → Pagefind 索引 → 复制索引
pnpm preview      # 本地预览生产产物（唯一推荐的预览方式）
pnpm sync         # 重新生成内容集合类型
pnpm format       # Prettier 格式化
pnpm lint         # ESLint
```

`pnpm build` 是**自检的唯一标准**：它包含类型检查，不通过就不要提交。

---

## 4. 最高优先级约束（速查）

完整清单见 [constraints.md](AGENTS/constraints.md)，这里只列最容易踩的五条：

1. **不要给 Keystatic 加 `format: { contentField: "content" }`** → 会让文章正文变空
2. **`keystatic.config.ts` 必须与 `src/content.config.ts` schema 对齐** → 否则构建校验失败
3. **`site.url` 恒定主域名**；备用站不做 noindex，只让 canonical 指向主域
4. **不要开启 `dynamicOgImage`** → 内置生成器只有拉丁字体，中文会变方块
5. **正文图片用 `<SmartImage key="..." />` + `src/data/images.json`**，不要散落图床 URL
6. **不要用 `wrangler` 创建生产 Pages 项目** → 会变成"直接上传"类型，永久失去 Git 自动部署；
   必须在 dashboard 用 Connect to Git 创建

---

## 5. 环境自检（新机器 / 新 AI 会话开始时执行）

```bash
node -v                 # 需 >= 22.12.0
pnpm install
pnpm build              # 必须通过，否则不要继续后续工作
git status
```

### CLI 登录（通常用不到）

两端部署都走 **Git 集成 + GitHub Actions，全程不需要命令行登录**。

- **Azure 不要用 `az login`**：Azure CLI 不支持个人 Microsoft 账号，会直接报
  `AADSTS500200: ... is a personal Microsoft account`。Azure SWA 请用
  **Portal 网页**创建（个人账号可正常使用），步骤见 [deployment.md](AGENTS/deployment.md)
- **Cloudflare** 仅手动排查时才需要 `npx wrangler login`

> **日常写作只需要 `git`**：写文件 → `pnpm build` 自检 → `git push` 即完成双平台发布。

---

## 6. 目录导航

```
AGENTS.md                  # 本文件（入口 + 路由）
AGENTS/                    # 详细文档
  writing-guide.md         #   写作指南（frontmatter / 公式 / 图片 / 草稿）
  constraints.md           #   硬约束与禁忌（改代码前必读）
  architecture.md          #   技术栈 / 目录结构 / 路由表 / 内容管线
  deployment.md            #   环境变量 / 双平台部署 / 发布流程
  troubleshooting.md       #   已知坑与排查
docs/decisions.md          # 技术决策记录（ADR）
astro.config.ts            # 集成、i18n、markdown processor、env schema
astro-paper.config.ts      # 站点信息（域名/标题/语言/功能开关）
keystatic.config.ts        # 本地后台字段定义（仅 dev）
src/                       # 源码，结构见 architecture.md
scripts/copy-pagefind.mjs  # 构建后复制搜索索引
```

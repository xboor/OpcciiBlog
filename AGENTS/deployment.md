# 环境变量与部署

## 1. 环境变量

复制 `.env.example` 为 `.env` 后填写。全部为 `PUBLIC_` 前缀（构建期注入）。

| 变量 | 作用 | 主站 | 备用站 |
| --- | --- | --- | --- |
| `PUBLIC_DEPLOY_TARGET` | `main` / `backup`，控制 sitemap、robots、统计 | `main` | `backup` |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics token | 填 | 留空 |
| `PUBLIC_GISCUS_REPO` | giscus 仓库，格式 `user/repo` | 填 | 可选 |
| `PUBLIC_GISCUS_REPO_ID` | 仓库 ID | 填 | 可选 |
| `PUBLIC_GISCUS_CATEGORY` | Discussions 分类名 | 填 | 可选 |
| `PUBLIC_GISCUS_CATEGORY_ID` | 分类 ID | 填 | 可选 |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console 验证串 | 填 | 留空 |

**缺省行为（无需配置即可用）**：

- `PUBLIC_DEPLOY_TARGET` 默认 `main`
- giscus 四项**缺任意一项，评论区整块不渲染**（不会报错、不会发无效请求）
- 统计与验证串留空则对应标签不输出

### `PUBLIC_DEPLOY_TARGET=backup` 时自动生效的行为

| 行为 | 位置 |
| --- | --- |
| 不生成 `sitemap-index.xml` / `sitemap-0.xml` | `astro.config.ts`（条件集成） |
| `robots.txt` 不含 `Sitemap:` 行 | `src/pages/robots.txt.ts` |
| `<head>` 不含 `<link rel="sitemap">` | `src/layouts/Layout.astro` |
| 不输出 Cloudflare 统计脚本 | `src/layouts/Layout.astro` |

**canonical 始终指向主域**，备用站**不做 noindex**。原因见
[constraints.md](./constraints.md) 第 3 条。

### giscus 配置怎么拿

1. 仓库必须是 **public**
2. 在仓库 Settings → General → Features 中勾选 **Discussions**
3. 创建一个 Discussion 分类（如 `Announcements`，类型选 Announcement 以避免非管理员建帖）
4. 打开 <https://giscus.app/>，填入 `user/repo` 与分类，复制它生成的 4 个值

---

## 2. Cloudflare Pages（主站）

在 CF Dashboard 以 **Git 集成**方式创建项目：

| 配置项 | 值 |
| --- | --- |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node 版本 | 22（环境变量 `NODE_VERSION=22`） |
| 环境变量 | `PUBLIC_DEPLOY_TARGET=main` + 第 1 节其余变量 |

不需要 `wrangler.toml`，也不需要额外的 CI 配置文件。

---

## 3. Azure Static Web Apps（备用站）

**全程在 Azure Portal 网页操作，不需要 Azure CLI。**（CLI 不支持个人账号，原因见第 5 节）

创建步骤：

1. 用个人 Microsoft 账号登录 <https://portal.azure.com>
2. 创建资源 → 搜索 **Static Web App**
3. **Deployment source 选 `Other`**（关键：选 GitHub 会被强制走它的自动向导）
4. Plan type 选 **Free**
5. 创建后进入该资源 → Overview → **Manage deployment token**，复制 token
6. GitHub 仓库 → Settings → Secrets and variables → Actions，新增 secret：
   `AZURE_STATIC_WEB_APPS_API_TOKEN`
7. 在仓库加入部署工作流（Portal 也可能已自动生成一份），构建步骤需传入
   `PUBLIC_DEPLOY_TARGET=backup`

| 配置项 | 值 |
| --- | --- |
| App location | `/` |
| Output location | `dist` |
| 构建环境变量 | `PUBLIC_DEPLOY_TARGET=backup` |

- 若工作流自行执行构建，**务必确认它把 `PUBLIC_DEPLOY_TARGET` 设为 `backup`**，
  否则备用站会生成 sitemap
- 用 `Azure/static-web-apps-deploy@v1` 时，若此前已 `pnpm build`，需设
  `skip_app_build: true`，避免重复构建
- `public/staticwebapp.config.json` 负责 404 回退（`/404.html`）、`trailingSlash: always`
  与安全响应头，会随构建进入 `dist`，无需额外配置

### 3.1 如果 Azure 账号本身不可用

备用站只托管纯静态 `dist/`，**任何静态托管平台都能胜任**，且 SEO 分流逻辑
（`PUBLIC_DEPLOY_TARGET=backup` + canonical 指向主域）**不依赖平台特性**。可替换为：

| 平台 | 是否需 CLI | 备注 |
| --- | --- | --- |
| Netlify | 否 | Git 集成；构建命令 `pnpm build`，发布目录 `dist` |
| Vercel | 否 | Git 集成，零配置即可 |
| GitHub Pages | 否 | 用 Actions 部署，注意 `base` 路径与 `site` 的关系 |

替换时只需：加对应平台的构建配置（或直接用默认值）、把 `PUBLIC_DEPLOY_TARGET=backup`
加进其环境变量。`public/staticwebapp.config.json` 是 Azure 专有格式，换平台后可删除。

---

## 4. 发布流程

```
本地写作 → pnpm build 自检 → pnpm preview 眼看 → git push
                                                        ↓
                        GitHub ──┬→ Cloudflare Pages 自动构建（主站）
                                 └→ Azure SWA 自动构建（备用站）
```

**本地只用 `astro preview` 预览，不使用云端预览环境。** 这样更快、也不消耗平台额度。

---

## 5. 关于 CLI 登录（重要）

**本项目部署全程不需要 Azure CLI。**

### Azure CLI 为什么不适用于个人账号

Azure CLI 这个客户端应用**不支持个人 Microsoft 账号**（@outlook.com / @hotmail.com 等 MSA），
会直接返回：

```text
AADSTS500200: User account 'xxx@hotmail.com' is a personal Microsoft account.
Personal Microsoft accounts are not supported for this application unless explicitly invited
to an organization.
```

这是 CLI 的既定限制，不是配置问题。另外从 2025 年 9 月起，Microsoft 对命令行工具
强制要求 MFA，`az login --username --password` 这种非交互写法也已失效。

**Azure Portal（网页）不受此限制** —— 个人账号可以正常注册 Azure 账号、创建 SWA，
所以走第 3 节的 Portal 流程即可。

### Cloudflare 侧（可选）

Cloudflare 也走 Git 集成，仅需手动排查时使用：

```bash
npx wrangler login      # 可选
npx wrangler whoami     # 检查登录状态
```

> **日常写作只需要 `git`。** 两端的自动部署都不依赖任何 CLI 登录。

---

## 6. 部署验证清单

上线后逐项确认：

- [ ] 主域 `/` 可访问，`<link rel="canonical">` 指向主域
- [ ] 主域 `/sitemap-index.xml` 存在，`/robots.txt` 含 `Sitemap:` 行
- [ ] 备域可访问，且**不生成** sitemap、`robots.txt` 无 `Sitemap:` 行
- [ ] 备域 canonical 指向主域，且**没有** `noindex`
- [ ] 主域 `/search/` 能搜到中文（依赖 Pagefind 索引已随产物部署）
- [ ] 文章页公式、代码高亮、callout 正常
- [ ] giscus 评论能加载（仓库 public、Discussions 已开启）
- [ ] 亮/暗色切换时评论区配色同步

# 环境变量与部署

> 项目版本：v1.1

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

### giscus（本项目已配置完成）

已在 `2026-10-17` 通过 GitHub GraphQL API 开启 Discussions 并取得配置，`.env` 里已填好：

| 值 | 内容 |
| --- | --- |
| repo | `xboor/OpcciiBlog` |
| repo-id | `R_kgDOVM15YQ` |
| category | `Announcements` |
| category-id | `DIC_kwDOVM15Yc4DIrPv` |

选 `Announcements`（Announcement 类型）是刻意的：普通用户无法在该分类下建帖，
只有 giscus App 能建，可防止访客随手创建重复主题。这 4 个值**本身是公开的**，
会内联在每个文章页的 HTML 里（原因见第 5.1 节），所以写进文档无风险。

若将来要换仓库/分类，重新取值的办法：仓库 Settings → General → Features 勾选
**Discussions** → 建分类 → 到 <https://giscus.app/> 填入 `user/repo` 与分类取值。
仓库必须是 **public**。

---

## 2. Cloudflare Pages（主站 · opccii.com）

### 2.1 本站实际状态（已核实）

| 项 | 状态 |
| --- | --- |
| 账号 ID | `922e98f4017b9bb27e0ec58f41fec4ce` |
| `opccii.com` 区域 | **已在 Cloudflare**（NS = `gabriella/nico.ns.cloudflare.com`），区域活跃 |
| `opccii.com` 顶点记录 | **无任何记录** → 需在接入 Pages 时创建 |
| `a.opccii.com` | 由另一个项目 `sink-cf` 使用，**不要动这条记录** |
| 旧项目 `opccii-blog` | 已绑定 `opccii.com`，4 个月前废弃、连的是旧仓库 → **需先解除占用** |

### 2.2 ⚠️ 必须用 Git 集成创建项目（重要陷阱）

Cloudflare 官方明确：**「If you choose Direct Upload, you cannot switch to Git integration
later. You will have to create a new project with Git integration.」**

即：项目类型（Git 集成 / 直接上传）**创建后不可互转**。

- ❌ **不要**用 `wrangler pages project create` 建项目 —— 那会建成"直接上传"类型，
  从此永久无法接入 Git 自动部署，废掉 push→自动发布的工作流
- ✅ **必须**在 dashboard 里通过 **Connect to Git** 创建

### 2.3 操作步骤

**A. 解除旧项目对域名的占用**

1. 进入旧项目 `opccii-blog` → Custom domains → 移除 `opccii.com`
2. 若不再需要该项目，可顺手删除它（它连的是 4 个月前的旧仓库）

**B. 以 Git 集成创建新项目**

1. CF Dashboard → Workers & Pages → Create → Pages → **Connect to Git**
2. 授权 GitHub：若 CF GitHub App 的仓库授权范围是 "Only select repositories"，
   需先把 `xboor/OpcciiBlog` 加入其可见列表（GitHub → Settings → Applications）
3. 选择仓库 `xboor/OpcciiBlog`，分支 `main`

| 配置项 | 值 |
| --- | --- |
| Framework preset | `Astro`（或 None，不影响结果） |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| 环境变量 `NODE_VERSION` | `22` |

**C. 填环境变量**（Settings → Environment variables，**Production 环境**）

| 变量 | 值 |
| --- | --- |
| `PUBLIC_DEPLOY_TARGET` | `main` |
| `PUBLIC_GISCUS_REPO` | `xboor/OpcciiBlog` |
| `PUBLIC_GISCUS_REPO_ID` | `R_kgDOVM15YQ` |
| `PUBLIC_GISCUS_CATEGORY` | `Announcements` |
| `PUBLIC_GISCUS_CATEGORY_ID` | `DIC_kwDOVM15Yc4DIrPv` |
| `PUBLIC_CF_ANALYTICS_TOKEN` | 可选，CF Web Analytics 的 beacon token |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | 可选，Search Console 验证串 |

> `.env` **不会**自动同步到平台 —— 本地 `.env` 只用于本地构建与预览。

**D. 绑定主域名**

1. 新项目 → Custom domains → Set up a custom domain → 输入 `opccii.com`
2. 区域已在 CF，Cloudflare 会**自动创建所需的 CNAME 记录**（已经是 CF 权威区，
   无需手工加 A 记录，apex 由 CF 做 CNAME 拉平）
3. 等证书签发完成（通常几分钟）

**E. 触发首次部署**

push 一次或点 dashboard 上的 "Retry deployment" 即可。之后 `git push` 自动构建。

**F. 可选：Cloudflare Web Analytics**

Dashboard → Analytics → Web Analytics → 添加站点 → 复制 beacon token 填进
`PUBLIC_CF_ANALYTICS_TOKEN`（仅主站输出该脚本）。

不需要 `wrangler.toml`，也不需要额外的 CI 配置文件。

---

## 3. Azure Static Web Apps（备用站 · backup.opccii.com）

**全程在 Azure Portal 网页操作，不需要 Azure CLI。**（CLI 不支持个人账号，原因见第 5 节）

### 3.1 本站的域名安排

| 项 | 值 |
| --- | --- |
| 备用域名 | `backup.opccii.com`（当前**无 DNS 记录**，需新建） |
| 该记录类型 | `CNAME` → Azure SWA 分配的默认主机名（形如 `xxx.azurestaticapps.net`） |
| 代理状态 | 建议先设为 **DNS only（灰云）**，等 Azure 验证并签发证书后再视需要切为代理 |
| 构建环境变量 | `PUBLIC_DEPLOY_TARGET=backup` |

> `backup.opccii.com` 是子域名，用标准 CNAME 即可，**不需要**像 apex 那样做拉平。
> Azure SWA 的证书签发需要域名能解析到它，所以先加记录再在 Portal 里绑域名。

### 3.2 创建步骤

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
- `public/staticwebapp.config.json` 负责 404 回退（`/404.html`）与安全响应头，
  会随构建进入 `dist`。不要设置 `trailingSlash: always`：Azure 也会给 JS 文件
  添加尾斜杠，导致相对动态导入路径错误、搜索无法加载。使用平台默认路径处理。

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

### 5.1 关于 `PUBLIC_` 变量为什么可以进公开仓库

`.env` 本身不会泄露（已被 `.gitignore` 忽略、实测 `git check-ignore` 生效）。但更重要的是：
**这些带 `PUBLIC_` 前缀的值本来就注定是公开的**，不需要"泄露"这个动作。

实测：用假值构建后，`PUBLIC_CF_ANALYTICS_TOKEN` 会内联进全部 10 个页面的 HTML，
giscus 四项会内联进文章页。任何人右键「查看源代码」即可读到 —— 因为浏览器必须能读到
它们，统计与评论才能工作。这是 Astro `PUBLIC_` 前缀的设计语义，不是漏配。

逐项结论：这些变量**没有一个是真秘密**（CF analytics token 只能伪造统计数字，
giscus 四项本就是 giscus.app 明文给出的嵌入参数）。

**真正的密钥不能在 `.env` 里**：

| 密钥 | 存放位置 |
| --- | --- |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | GitHub Actions Secrets（加密，clone/fork 拿不到） |
| Cloudflare 侧 | 走 GitHub App 授权，仓库不放 token |

铁律：**任何不带 `PUBLIC_` 的机密都不要写进本仓库**。本项目是纯静态、无服务端运行时，
所以机密只能放 CI 的 Secrets。提交前 `git status` 若看到 `.env` 出现在未跟踪列表里，
说明 ignore 失效了 —— 立即停下排查。

---

## 6. 部署验证清单

上线后逐项确认：

- [ ] `https://opccii.com/` 可访问，`<link rel="canonical">` 指向 `opccii.com`
- [ ] `opccii.com/sitemap-index.xml` 存在，`/robots.txt` 含 `Sitemap:` 行
- [ ] `backup.opccii.com` 可访问，且**不生成** sitemap、`robots.txt` 无 `Sitemap:` 行
- [ ] 备域 canonical 指向主域，且**没有** `noindex`
- [ ] `a.opccii.com`（另一个项目）**未受影响**
- [ ] 主域 `/search/` 能搜到中文（依赖 Pagefind 索引已随产物部署）
- [ ] 文章页公式、代码高亮、callout 正常
- [ ] giscus 评论能加载（仓库 public、Discussions 已开启）
- [ ] 亮/暗色切换时评论区配色同步

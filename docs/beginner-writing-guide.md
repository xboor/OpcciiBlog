# Opccii 博客：从零开始写作、修改页面与发布

适用项目：`xboor/OpcciiBlog`，本机目录 `E:\blog\astro\AstroBlog`。最后核对：2026-10-17。

这份指南面向没有编程和 Git 经验的作者。你不需要先学会 Astro、React 或 Vue，日常写作主要是编辑文本文件，再执行几条命令。

本指南中的新版首页文案位置包含本地已经完成的设计修改；如果 GitHub 上还没有这些字段，说明那批设计修改尚未推送。

## 阅读顺序

- 已经能在这台电脑上预览：从[第一次写文章](#4-第一次写文章完整练习)开始。
- 刚换电脑、还没配置环境：从[准备工具](#2-准备工具只在新电脑上做一次)开始。
- 想改网站名字或关于页面：看[修改页面与站点信息](#6-如何修改网站名字首页和关于页面)。
- 想学 Markdown：看[写作语法](#5-markdownmdx-写作语法)。
- 准备上线：看[Git 配置](#9-git-初次配置与登录)和[发布流程](#10-每天写作与发布的完整流程)。
- 以后忘了命令：直接看最后的[速查卡](#14-日常速查卡)。

更精确的项目规范仍以 [AGENTS/writing-guide.md](../AGENTS/writing-guide.md) 为准。修改代码前先读 [AGENTS.md](../AGENTS.md) 和 [AGENTS/constraints.md](../AGENTS/constraints.md)。

## 1. 先分清楚几个概念

| 名词 | 可以怎样理解 |
| --- | --- |
| 项目文件夹 | 你电脑上的博客原稿、图片和设置 |
| Markdown（`.md`） | 用简单符号表示标题、列表、链接的文本格式 |
| MDX（`.mdx`） | Markdown 加上组件能力；本项目文章统一建议使用它 |
| Astro | 把原稿转换成网页的工具，日常写作不需要修改它 |
| 终端 | 输入命令的窗口；本文以 Windows 的 PowerShell 为例 |
| Git | 记录文件修改历史的工具 |
| GitHub | 存放这个项目远程副本的网站；不是 Git 本身 |
| commit | 在本地保存一次可追踪的修改记录 |
| push | 把本地提交发送到 GitHub |
| 构建 | 检查文件并生成最终网页，本项目命令是 `pnpm build` |
| 部署 | 把最终网页发布到网站服务器 |
| frontmatter | 文章开头两条 `---` 之间的标题、日期等信息 |
| slug | 文章网址里代表文章的那一段，通常来自英文文件名 |

当前发布关系：

```text
电脑上写文件并保存
    ↓ git add + git commit
本地历史记录
    ↓ git push origin main
GitHub：xboor/OpcciiBlog 的 main 分支
    ├─ Cloudflare Pages 自动构建 → https://opccii.com/
    └─ GitHub Actions 自动构建 → Azure → https://backup.opccii.com/
```

**保存文件不会上线，commit 也不会上线；推送到 GitHub 的 `main` 后才会触发两端发布。** 两端独立执行，可能先后完成；某端失败通常会继续提供它之前的成功版本。

## 2. 准备工具：只在新电脑上做一次

### 2.1 安装什么

| 工具 | 用途 | 来源 |
| --- | --- | --- |
| VS Code | 打开文件夹、写文章、运行终端 | [官网下载](https://code.visualstudio.com/) |
| Node.js | 运行博客构建工具 | [官网下载](https://nodejs.org/en/download) |
| Git for Windows | 下载、提交与推送仓库 | [官网下载](https://git-scm.com/install/windows) |
| pnpm | 安装项目依赖、执行项目命令 | 按下一节安装 |

项目要求 Node.js 至少 `22.12.0`。为了与当前 Azure 工作流一致，建议安装 **Node.js 24.x**。已经安装且能构建的电脑，不需要重复安装或随意升级。

VS Code 的 Astro 扩展有助于编辑 `.astro` 文件，但普通文章写作不依赖它。Markdown 自带预览能看基本格式，**不能完全模拟本站 MDX、图片组件与数学公式**，最终要看博客本地预览。

### 2.2 打开终端并验证

在 VS Code 中选择“终端 → 新建终端”。下面每行是一条命令，复制一行、按一次 Enter，等它完成后再执行下一行。不要复制代码块的围栏或屏幕上的 `PS E:\...>` 提示符。

```powershell
node -v
npm -v
git --version
```

能看到版本号，表示对应工具可用。如果提示“无法识别”，先关闭并重新打开 VS Code；仍失败，再检查是否安装成功。

安装本项目指定的 pnpm：

```powershell
npm install --global pnpm@12.8.2
pnpm -v
```

如果 PowerShell 提示禁止运行 `pnpm.ps1` 或 `npm.ps1`，可以使用 `pnpm.cmd`、`npm.cmd` 代替本文对应命令，不必为了写博客直接修改系统执行策略。

### 2.3 已经有项目时怎样打开

这台电脑已有项目，不要再次 clone 到它里面，也不要执行 `git init`。

1. VS Code →“文件 → 打开文件夹”。
2. 选择 `E:\blog\astro\AstroBlog`。
3. 左侧应看到 `package.json`、`astro-paper.config.ts`、`src` 等。
4. 打开终端，执行：

```powershell
Set-Location 'E:\blog\astro\AstroBlog'
git status
pnpm install
pnpm build
```

构建最后应成功完成；类型检查应显示 `0 errors`。出现错误先解决，不要继续发布。

### 2.4 新电脑怎样下载项目

仅在**不存在这份本地仓库**时使用：

```powershell
Set-Location 'E:\blog\astro'
git clone https://github.com/xboor/OpcciiBlog.git AstroBlog
Set-Location '.\AstroBlog'
pnpm install
pnpm build
```

上面的父目录必须先存在；也可以换成你自己已经创建的工作目录。`clone` 会创建 `AstroBlog` 子文件夹，之后在 VS Code 打开它。

公开仓库可以被其他人下载，但推送更新必须使用有写入权限的 GitHub 账号。

### 2.5 本地环境变量是否必填

缺少 `.env` 时，基本阅读和构建仍可使用；评论、统计等可选功能可能不显示。

如果新电脑没有 `.env`，可以在 VS Code 中复制 `.env.example` 并将副本改名为 `.env`，再按模板填写。已有 `.env` 就不要覆盖。

日常写文章通常不用修改它。不要把 Azure 部署令牌、GitHub 凭据放进文章或普通配置文件。Azure 现有部署令牌放在 GitHub Actions 的加密 Secret 中，新电脑无需复制它。

## 3. 文件在哪里：常用位置地图

下表的路径都相对于项目根目录 `E:\blog\astro\AstroBlog`。

| 想做什么 | 编辑哪里 |
| --- | --- |
| 新增或修改文章 | `src/content/posts/英文文件名.mdx` |
| 改“关于本站”的标题和正文 | `src/content/pages/about.md` |
| 改网站名字、作者、站点描述、社交链接 | `astro-paper.config.ts` |
| 改新版首页大标题、简介、按钮文字 | `src/i18n/lang/zh.ts` 中的 `home` |
| 改顶部“文章、标签、关于”等文字 | `src/i18n/lang/zh.ts` 中的 `nav` |
| 改文章列表、搜索、归档页面的标题和介绍 | 同文件的 `pages` |
| 管理正文图片地址 | `src/data/images.json` |
| 放随仓库管理的图片 | 例如 `public/images/`，没有可新建 |
| 默认分享预览图 | `public/default-og.jpg` |
| 改背景色、文字颜色、主题配色 | `src/styles/theme.css`，属于代码改动 |
| 改毛玻璃导航、布局间距等样式 | `src/styles/global.css`、`src/components/Header.astro` |
| 查看 Azure 自动发布规则 | `.github/workflows/azure-static-web-apps.yml` |

**不要在 `dist/`、`public/pagefind/` 或 `node_modules/` 里写文章。** 它们是生成文件或依赖，重新构建、安装时可能被更新，也不应提交到 Git。

## 4. 第一次写文章：完整练习

### 4.1 创建文件

项目已提供模板 `src/content/posts/_post-template.mdx`。可以在 VS Code 复制、粘贴该文件，
将副本改名为 `my-first-note.mdx`，再按其中提示修改。副本必须去掉文件名开头的 `_`，
并在需要预览时把 `draft: true` 改为 `false`。模板里的说明和不适用的小节可以删除。

在 VS Code 左侧展开 `src → content → posts`，右键 `posts` →“新建文件”，输入：

```text
my-first-note.mdx
```

使用英文小写、数字和连字符 `-`。中文文章标题写在文件内部。文件名不要以 `_` 开头（以下划线开头的文件会被构建忽略），也不要命名为 `.mdx.txt`。关于是否使用子文件夹组织文章，见[下一节](#46-用子文件夹组织多篇文章)。

### 4.2 复制这份可用的模板

下面**整段**复制进新文件。最外面的四反引号只是指南的展示标记，不要一起复制。

````mdx
---
title: "我的第一篇笔记"
description: "记录第一次使用这个博客写作的过程。"
pubDatetime: 2026-10-17T01:00:00+08:00
tags: ["随笔", "学习记录"]
featured: false
draft: false
---

这是我的第一篇博客。我准备在这里记录学习、技术和生活。

## 为什么开始写作

把想法整理成文字，可以帮助我发现自己真正理解了什么。

## 今天学会了什么

- 创建一篇文章。
- 使用 Markdown 写标题和列表。
- 在本地检查，再发布到网站。

## 一个小例子

下面是一段代码：

```js
console.log("你好，世界！");
```

## 下一步

下一篇文章，我想记录一个具体的问题和它的解决过程。
````

`pubDatetime` 请改为你实际的发布时间，第一次练习可使用一个已经过去的时间。示例中的 `+08:00` 表示北京时间。

按 `Ctrl+S` 保存。网页文章标题由 `title` 生成，所以正文从 `##` 二级标题开始，通常不需要再写一个 `# 我的第一篇笔记`。

### 4.3 frontmatter 逐项解释

| 字段 | 必填 | 怎么填 |
| --- | --- | --- |
| `title` | 是 | 文章标题，列表和文章页都会使用 |
| `description` | 是 | 一两句摘要，显示在文章列表，也用于网页描述 |
| `pubDatetime` | 是 | 发布时间，例如 `2026-10-17T09:30:00+08:00` |
| `tags` | 否 | 标签数组，例如 `["数学", "学习记录"]`；省略默认是 `others` |
| `featured` | 否 | `true` 进入首页精选；`false` 为普通文章 |
| `draft` | 否 | `true` 隐藏文章，`false` 允许发布 |
| `modDatetime` | 否 | 更新日期，格式与发布时间相同；未更新就不写 |
| `author` | 否 | 不写时使用站点作者 |
| `ogImage` | 否 | 分享到社交平台时的预览图；不等于正文插图 |
| `hideEditPost` | 否 | `true` 隐藏文章上的“编辑此页”链接 |
| `timezone` | 否 | 一般不写，默认使用 `Asia/Shanghai` |
| `canonicalURL` | 否 | 转载等特殊情况指向原文；原创文章通常留空、不写此行 |

需要更新日期时，在两条 `---` 之间增加一行：

```yaml
modDatetime: 2026-10-18T10:00:00+08:00
```

这些是 YAML 格式。注意以下规则：

- 字段名保持英文拼写和大小写，如 `pubDatetime`。
- 使用英文冒号 `:`，冒号后有一个空格。
- 标题和摘要建议加英文双引号，避免正文中的冒号等符号产生歧义。
- 如果文字里也需要双引号，可以改用中文引号“……”或将内部英文双引号写成 `\"`。
- 日期按示例写，**不要加引号**；当前 schema 要求日期类型。
- 布尔值写小写 `true` 或 `false`，不要写“是”“否”，也不要给它们加引号。
- 没有值的可选字段直接省略，不要写空的 `modDatetime:`。

### 4.4 在本地看文章

发布前推荐用真实生产产物预览：

```powershell
pnpm build
pnpm preview
```

终端会显示本地网址，默认通常是 `http://localhost:4321/`。打开它，再进入“文章”或直接访问：

```text
http://localhost:4321/posts/my-first-note/
```

终端运行预览时一直被占用是正常的。停止服务按 `Ctrl+C`；如果询问是否终止，按提示确认。若端口被占用，使用终端实际显示的地址，或先关闭之前的服务。

`pnpm preview` 不会在保存源文件后自动重新构建。改完内容后，需要停止预览，再执行 `pnpm build`、`pnpm preview`。

想边写边看、保存后自动更新，可以用 `pnpm dev`。但**最终检查仍必须是 `pnpm build` 后的 `pnpm preview`**，尤其是搜索、日期过滤和发布效果。

### 4.5 草稿和定时发布

写到一半时，可以设：

```yaml
draft: true
```

本项目的草稿会被列表和文章路由排除，**在 `pnpm dev` 中也看不到**。想本地预览草稿，可以暂时设为 `false`，但别在没准备好时推送。

仓库是公开的。即使 `draft: true` 不在博客展示，只要把文件推送到 GitHub，别人仍可能直接读取原稿。真正不想公开的内容先保存在仓库外。

未来时间超过构建时的“当前时间 + 15 分钟”，生产构建会跳过文章；开发模式会显示非草稿的未来文章，因此可能出现“本地 dev 看得到，线上看不到”。

**这是纯静态网站，没有到点自动发布的计时器。** 时间到了之后，还需要重新触发构建部署。初学者先使用过去或当前的时间，避免依赖定时行为。

### 4.6 用子文件夹组织多篇文章

前面的练习把文章直接放在 `src/content/posts/` 下。这是最简单的结构，适合初期只有几篇文章的阶段。当同一主题下有多篇关联文章时，可以用子文件夹分组。

#### 什么情况下值得使用子文件夹

| 场景 | 示例 |
| --- | --- |
| 一个系列有 3 篇以上文章 | 数学系列、技术入门系列 |
| 想按年份归档 | `posts/2026/`, `posts/2027/` |
| 想按领域分类 | `posts/math/`, `posts/engineering/`, `posts/life/` |
| 一篇文章拆成多篇笔记 | 同一主题下有独立但相关的多篇短文 |

**不建议**为了"看起来整齐"就提前分组。只有文章量多了、一个文件夹里十几篇以上时，分组才真正有帮助。

#### 文件夹结构和 URL 怎么对应

项目底层用递归匹配加载文章，同时用 catch-all 路由 `posts/[...slug]` 生成页面。**URL 会完整镜像子文件夹层级**，文件名去掉扩展名就是最后一段：

| 文件路径（相对于项目根目录） | 最终访问地址 |
| --- | --- |
| `src/content/posts/my-first-note.mdx` | `/posts/my-first-note/` |
| `src/content/posts/math/calculus-notes.mdx` | `/posts/math/calculus-notes/` |
| `src/content/posts/2026/10/latex-tips.mdx` | `/posts/2026/10/latex-tips/` |
| `src/content/posts/tech/astro/build-website.mdx` | `/posts/tech/astro/build-website/` |

frontmatter 的 `title`、`tags`、`pubDatetime` 等字段与扁平结构完全相同，没有因为放进子文件夹而需要额外字段。

#### 在 VS Code 里创建子文件夹文章

1. 左侧展开 `src → content → posts`。
2. 右键 `posts`（或已有的某个子文件夹）→ "新建文件夹"，输入 `math`。
3. 右键刚创建的 `math` 文件夹 → "新建文件"，输入 `calculus-notes.mdx`。
4. 按前面的 frontmatter 模板填写内容。

要注意以下几点：

- **文件夹名也会进入 URL。** 如果以后把 `math/calculus-notes.mdx` 挪到 `notes/calculus-notes.mdx`，URL 就会从 `/posts/math/calculus-notes/` 变成 `/posts/notes/calculus-notes/`。旧链接、搜索引擎索引和基于 URL 关联的 giscus 评论可能失效。
- **SmartImage 的 key 仍然全局唯一。** 清单 `src/data/images.json` 中的 key 不带路径前缀，所以即使两篇不同文件夹的文章，图片 key 也不能重复。建议用文件夹名做前缀，例如 `math-calculus-notes-cover`。
- **标签（`tags`）和文件夹是两套体系。** 标签给文章打"主题"，文件夹给文章放"位置"。两者互不冲突，可以同时使用。例如一篇 `math/calculus-notes.mdx` 可以有 `tags: ["数学", "学习笔记"]`。
- **Keystatic 与子文件夹的兼容性有限。** 当前项目 Keystatic 配置的扫描路径是单层的 `src/content/posts/*`（只匹配 `posts` 根目录直接放置的 `.mdx`），所以**子文件夹中的文章不会出现在 Keystatic 后台列表里**。想管理子文件夹文章，只能用 VS Code 直接编辑物理文件。如果以后希望 Keystatic 也能看到嵌套文章，需要把扫描路径改成 `src/content/posts/**/*`（这属于代码配置层面的改动，零基础阶段不建议自行修改）。

#### 从扁平结构迁移到子文件夹

如果你想把已经发布过的扁平文章挪进子文件夹：

1. 先在本地把 `.mdx` 拖进目标子文件夹。
2. 构建并预览，确认 URL 变了但内容正常。
3. 用 `git mv` 或直接提交这次移动（两者对 Git 来说区别不大）。
4. 推送后旧 URL 会返回 404。如果需要保留旧链接，可以在文章顶部 `canonicalURL` 加进去，但没有自动重定向；静态网站上历史链接失效是普遍情况。

**如果文章下方有 giscus 评论，评论是绑定 URL 的，挪位置后评论会跟着丢失。** 移动前请确认这篇文章是否有需要保留的讨论。

## 5. Markdown／MDX 写作语法

### 5.1 段落和换行

两段文字之间空一行：

```markdown
这是第一段。

这是第二段。
```

只按一次 Enter，渲染后不一定产生你想要的分段。普通文章优先使用空行分段。

### 5.2 标题、强调和分隔线

```markdown
## 二级标题

### 三级标题

这是 **加粗文字**，这是 *斜体文字*，这是 ~~删除线~~。

---
```

`##` 后面要有空格。建议按 `## → ### → ####` 组织内容，不要因为想把字变小就跳过标题层级。标题数量不宜太多，每个标题下面应有实际内容。

### 5.3 列表

```markdown
- 第一项
- 第二项
  - 第二项下面的小项

1. 第一步
2. 第二步
3. 第三步
```

列表前后留空行。无先后顺序用 `-`，操作步骤用数字；不要只用空格把正文排成表格。

### 5.4 引用和提示框

```markdown
> 这是一段引用。引用别人的话时记得注明来源。

> [!NOTE]
> 这是补充说明。

> [!TIP]
> 这是一条小技巧。

> [!WARNING]
> 这一步需要特别注意。
```

提示框还支持 `IMPORTANT` 和 `CAUTION`。多行提示每行都要有 `>`。

### 5.5 链接

```markdown
[访问我的博客](https://opccii.com/)

[关于本站](/about/)

[阅读第一篇笔记](/posts/my-first-note/)
```

方括号里是显示文字，小括号里是目标地址。站内链接以 `/` 开头，写网站路径，**不要写电脑上的 `E:\...` 路径**。

文章文件名确定后，尽量不要改名。改名会改变链接，旧链接、别人收藏的地址以及基于路径关联的评论可能受到影响。仅修改 `title` 通常不会改变英文文件名对应的 URL。

### 5.6 行内代码与代码块

句子中的命令用反引号包起来：

```markdown
先执行 `pnpm build`，再查看结果。
```

代码块前后使用三个反引号，起始处可写语言名：

````markdown
```python
print("你好，世界")
```
````

常用语言名有 `js`、`ts`、`python`、`bash`、`powershell`、`json`、`text`。本项目会自动高亮，并提供代码复制按钮。

### 5.7 表格

```markdown
| 项目 | 说明 |
| --- | --- |
| Markdown | 日常排版 |
| MDX | 支持组件的 Markdown |
```

宽表格在手机上不容易阅读，能用短列表表达时优先短列表。

### 5.8 数学公式

行内公式使用一对美元符号：

```markdown
质能方程是 $E = mc^2$。
```

单独成块的公式使用两对美元符号：

```markdown
$$
\frac{a+b}{c} = \sqrt{x^2+y^2}
$$
```

不用安装公式插件，本站已配置。公式里的反斜杠不要改成全角符号；复杂公式若报错，先缩减到简单表达式再逐步添加。

### 5.9 MDX 与普通 Markdown 的区别

大部分 Markdown 都能直接写在 `.mdx` 中。但 MDX 还会解释 HTML 标签和花括号，例如 `<SmartImage />` 是组件，`{...}` 可以是表达式。

想原样展示尖括号、花括号或命令，最稳妥的方法是放在行内代码或代码块里。不要把未经处理的 HTML、脚本、Word 排版内容整段粘进 MDX。

普通 Markdown 图片语法长这样，用来认识语法即可：

```markdown
![对图片内容的描述](/images/example.jpg)
```

**本项目正文图片采用下一节的 SmartImage 清单方式**，尤其不要把各个图床 URL 散落到不同文章里。

## 6. 如何修改网站名字、首页和关于页面

### 6.1 修改网站名字和作者

打开 `astro-paper.config.ts`，找到 `site`：

```ts
site: {
  url: "https://opccii.com/",
  title: "Opccii 的博客",
  description: "记录技术、数学与生活的个人博客。",
  author: "Opccii",
  // 其他配置保持原样
},
```

只修改相应引号内的内容，保留逗号、引号和括号：

- `title`：顶部网站名称、默认浏览器标签页标题等。
- `description`：默认网页描述，不是每一篇文章的摘要，也不一定等于首页介绍。
- `author`：未单独填写作者的文章所用的默认作者。

**不要为了备用站把 `site.url` 改成 Azure 地址。** 它必须保持主域名，关系到 canonical、RSS 和 sitemap。

### 6.2 修改新版首页的大标题和简介

打开 `src/i18n/lang/zh.ts`，找到 `home`：

```ts
home: {
  eyebrow: "OPCCII / 个人博客",
  headline: "把想法写下来，",
  headlineAccent: "让知识有迹可循。",
  intro: "记录技术、数学与生活。在这里，把零散的灵感整理成文字，也把探索的过程留给未来的自己。",
  startReading: "开始阅读",
  aboutSpace: "关于这个空间",
  spaceNote: "从一个问题开始，\n留下一点思考。",
  topics: "循着兴趣，继续探索",
  readPost: "阅读全文",
  writing: "文字与思考",
  // 其他字段保持原样
},
```

这是示意片段，**不要用它覆盖整个文件**，也不要删除未展示的字段。

| 字段 | 对应位置 |
| --- | --- |
| `eyebrow` | 大标题上方的小字 |
| `headline` | 首页第一行标题 |
| `headlineAccent` | 首页第二行强调色标题 |
| `intro` | 首页介绍段落 |
| `startReading` | “开始阅读”按钮 |
| `spaceNote` | 桌面端右侧短句，`\n` 表示换行；手机上隐藏 |
| `writing` | 文章区标题 |
| `topics` | 标签区域介绍 |
| `readPost` | 文章卡片上的阅读文字 |

这里是 TypeScript 配置，不能直接填 Markdown 标题或 `<br>`。在既有字段里改普通文字即可。英文版本对应 `src/i18n/lang/en.ts`；只改中文显示时不用强行修改英文。

首页文章列表自动从文章集合生成，不需要在首页重复写文章标题。`featured: true` 的文章进入精选；普通文章进入另一组列表，普通组数量由 `astro-paper.config.ts` 的 `posts.perIndex` 控制。首页不会把所有非精选文章无限列出，完整列表在“文章”页。

### 6.3 修改关于页面

打开 `src/content/pages/about.md`：

```markdown
---
title: "关于我"
description: "我的经历、兴趣与这个博客的由来。"
---

你好，我是 Opccii。

## 我在关注什么

这里可以写你的研究、技术、阅读或生活兴趣。

## 为什么写这个博客

这里写建站与写作的原因。
```

修改顶部 `title` 会修改关于页的大标题，以及该页浏览器标题中的页面部分。修改第二条 `---` 后的内容就是修改正文，语法与 Markdown 相同。

**保留文件名 `about.md`**。路由 `src/pages/about.astro` 按 `about` 读取它。顶部导航上的“关于”是另一个标签，需要改 `zh.ts` 的 `nav.about`，不会随正文标题自动变更。

### 6.4 改导航名称、列表介绍与社交链接

在 `src/i18n/lang/zh.ts`：

- `nav.posts`：导航中的“文章”。
- `nav.tags`：导航中的“标签”。
- `nav.about`：导航中的“关于”。
- `pages.postsTitle`、`pages.postsDesc`：文章列表页标题和介绍。
- `pages.searchTitle`、`pages.searchDesc`：搜索页面标题和介绍。
- `footer`：页脚文字。

改导航文字不等于改网址，不要自行把 `/posts/` 路由改成汉字。

社交链接在 `astro-paper.config.ts` 的 `socials`，现有 GitHub 地址可以替换为你的地址。添加新社交平台前要确认 `src/assets/icons/socials/` 有对应名称的图标。每页文章数在 `posts.perPage`；修改后重新构建。

### 6.5 单独添加一个 `.md` 页面会自动上线吗

不会。普通文章会自动生成路由，但 `src/content/pages/` 中的新文件还需要对应的 `src/pages/xxx.astro` 路由来展示。

零基础阶段可以先改已有关于页。想新增“友链”“项目”等固定页面时，说明需要的地址和内容，再单独处理路由及导航，别只创建文件就以为它已可访问。

## 7. 如何放图片：推荐先使用本地图片

### 7.1 把图片放进项目

例如把一张真实图片复制到：

```text
public/images/my-first-note/desk.jpg
```

没有文件夹就创建它。图片文件名尽量使用英文、小写、无空格。不要只改后缀冒充其他格式，重命名 `.png` 为 `.jpg` 不会转换图片格式。

该文件发布后的路径是：

```text
/images/my-first-note/desk.jpg
```

地址中**不包含 `public`**。建议先把图片压缩到适合网页的大小，避免一张普通插图就有几十 MB。

### 7.2 在清单中登记

打开 `src/data/images.json`。这个文件已有图片条目，添加时保留它们，不要覆盖整个文件。

下面的示例只展示新条目；把它作为对象中的一个成员添加：

```json
"my-first-note-desk": {
  "primary": "/images/my-first-note/desk.jpg",
  "fallbacks": []
}
```

JSON 的正确整体结构如下，`existing-picture` 只是解释结构的示例，不需要真的创建：

```json
{
  "existing-picture": {
    "primary": "/images/existing.jpg",
    "fallbacks": []
  },
  "my-first-note-desk": {
    "primary": "/images/my-first-note/desk.jpg",
    "fallbacks": []
  }
}
```

注意：条目之间要有英文逗号，最后一个条目后面没有逗号；键和值使用英文双引号；JSON 中不要写 `// 注释`。示意的 `existing-picture` 不代表仓库里当前已有这张图。

### 7.3 在文章中使用

在 `.mdx` 的 frontmatter 结束后、正文之前，添加一次：

```mdx
import SmartImage from "@/components/SmartImage.astro";
```

然后在需要放图的位置写：

```mdx
<SmartImage
  key="my-first-note-desk"
  alt="桌面上的电脑和一本打开的笔记本"
  width={1200}
  height={800}
  class="rounded-lg"
/>
```

- `key` 与清单中登记的名字完全相同，不能多空格或少字母。
- `alt` 简短描述图片内容，用于无障碍阅读和图片加载失败时的说明。
- `width`、`height` 使用原图的实际尺寸或正确比例，不要随意把竖图填成横图。
- 一个文件里多次使用 SmartImage，只需要导入一次。
- 添加图片后，提交文章、清单和图片文件，三者缺一可能导致构建失败或线上缺图。

`key` 缺失会在构建时报错；但清单里写错了本地图片路径或远程地址，构建不一定能发现，仍要打开页面检查图片是否真的显示。

### 7.4 使用图床及备用地址

将清单里的 `primary` 换成实际图片直链，备用图片直链放进 `fallbacks` 数组。主地址加载失败后会依次尝试备用地址。正文依然只写 `key`。

链接必须指向图片本身，不是上传页面、登录页面或相册网页。没有备用地址就用 `[]`。其他文件都不需要因为更换图床而改动。

### 7.5 分享预览图与正文图片不是同一件事

所有文章默认使用 `public/default-og.jpg` 作为分享预览图。你可以替换这张文件，但必须保留它。

某篇文章要单独设置分享图，可在 frontmatter 中增加：

```yaml
ogImage: "/images/my-first-note/share.jpg"
```

然后确保真实图片存在于 `public/images/my-first-note/share.jpg`。设置 `ogImage` 不会自动往正文插图，文章里仍按需使用 SmartImage。

## 8. 可选：使用本地可视化后台

不习惯编辑文件时，可以尝试 Keystatic：

```powershell
pnpm dev
```

打开本地服务的 `/keystatic`，通常是 `http://localhost:4321/keystatic`。

1. 选择“文章”或“页面”。
2. 新建或打开条目，填写标题、摘要、日期、标签和正文。
3. 中文标题对应的文件名（slug）建议手动填英文。
4. 保存后回 VS Code 查看实际生成、修改了哪些文件。
5. 执行构建和预览，再按 Git 流程发布。

这是本地文件编辑工具，保存到你的电脑，不会替你完成 `git commit` 或 `git push`。它只在开发模式挂载，正式网站没有公开写作后台。

图片按钮生成的形式可能不同于本项目 SmartImage 规范；正文图片仍建议按上一节维护。复杂 MDX 的最终效果以站点预览为准。不要为了改变编辑体验自行修改 `keystatic.config.ts` 的字段定义或 `format.contentField`。

## 9. Git 初次配置与登录

### 9.1 设置提交者名字和邮箱

先检查是否已经设置：

```powershell
git config --get user.name
git config --get user.email
```

在本项目目录中设置仅对此仓库生效的身份：

```powershell
git config user.name "你的显示名称"
git config user.email "你的GitHub提交邮箱"
```

把引号内文字替换为自己的信息，**不要原样提交示例邮箱**。名字可以是你希望出现在提交记录中的署名；它不是登录凭据。

GitHub 的 Settings → Emails 中可以查看自己的提交邮箱，也可以使用页面提供的隐私邮箱。公开仓库的提交记录可能公开该邮箱，所以按你的隐私偏好选择。

若明确希望本电脑所有仓库使用相同身份，再把上述命令改为 `git config --global ...`。全局设置会影响其他仓库，不必为了这个博客强制使用它。[Git 官方说明](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)

### 9.2 检查远程地址和分支

```powershell
git remote -v
git branch --show-current
```

本项目远程地址应是 `https://github.com/xboor/OpcciiBlog.git`，正常发布分支是 `main`。`origin` 是这个远程地址的常用简称。已经正确就不用修改。

**如果你使用的是别人的 fork 或其他分支，推送不等于会更新当前主站和备用站。** 现有部署绑定的是指定仓库与 `main`。

### 9.3 登录与 Git 身份不同

`git config user.name` 和 `user.email` 只说明“这次提交署名是谁”，不能代替 GitHub 登录。

Windows 上通过 HTTPS 推送时，Git Credential Manager 可以引导浏览器登录 GitHub。使用有仓库写入权限的账号完成授权即可。GitHub 不接受把账号密码直接当作 Git 的 HTTPS 密码；不要把密码或访问令牌写入远程 URL、文章或聊天记录。[GitHub 身份验证说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)

如果已经使用 GitHub CLI，也可以执行：

```powershell
gh auth status
```

需要重新配置时使用 `gh auth login`，按提示选择 GitHub.com、HTTPS、浏览器登录；如需让 Git 使用这套凭据，可运行 `gh auth setup-git`。这是一种可选路线，不需要为了写作同时配置多套登录方式。

如果提示 403 或 Permission denied，先确认账号是否正确及是否有仓库权限；反复修改 `user.name` 不会修复权限问题。

## 10. 每天写作与发布的完整流程

### 10.1 开始前：确认当前修改和远程更新

```powershell
Set-Location 'E:\blog\astro\AstroBlog'
git status
```

如果是干净工作区，且已经在 `main`，可以同步远程：

```powershell
git pull --ff-only origin main
```

如果有未提交修改，先看清它们是不是你需要的内容，**不要直接覆盖、清空或强行拉取**。可以先完成当前修改并做本地提交，再处理同步；不确定时保留文件并请人协助。

截至本指南编写时，本地还有上一轮设计改动未推送。第一次发布新文章前，请先检查它们；不要直接 `git add .` 把不想发布的设计一起带上。

### 10.2 写作并检查

新建或修改 `.mdx`，保存后执行：

```powershell
pnpm build
pnpm preview
```

在浏览器检查：标题、正文、插图、链接、代码、公式，以及手机窄屏时是否正常。**构建失败就不要发布。**

本项目搜索索引在构建时生成。开发服务中的搜索结果可能还是上一次构建的，所以搜索验证要在本次构建后的预览里进行。

### 10.3 查看你准备提交什么

```powershell
git status
git diff
```

`git diff` 主要显示已跟踪文件的修改；新建且尚未加入 Git 的文件不会完整出现在其中，要在 VS Code 中打开检查。

如果终端进入分页阅读界面，按 `q` 退出。

### 10.4 把需要的文件加入暂存区

只新增一篇无图片文章：

```powershell
git add src/content/posts/my-first-note.mdx
```

如果还增加了图片和清单条目，则也加入实际用到的文件，例如：

```powershell
git add src/data/images.json public/images/my-first-note/desk.jpg
```

别把不存在的示例路径原样复制执行。每次根据 `git status` 选择真正修改过的文件。

然后检查暂存内容：

```powershell
git diff --cached --stat
git diff --cached
```

`--cached` 表示只看下一次 commit 会包含的内容。确认没有遗漏，也没有带入无关文件。新手建议明确选择文件；只有确认本次所有修改都要提交时才使用 `git add .`。

### 10.5 创建本地提交

```powershell
git commit -m "post: 新增第一篇学习笔记"
```

引号内是这次修改的说明，可以用中文。示例：`post: 更新公式推导`、`content: 修改关于页面`。写清修改了什么，不必只写“更新”。

commit 成功后，你的记录还只在本地。可以用 `git log -1 --oneline` 查看最新一次提交。

### 10.6 推送到 GitHub

```powershell
git push origin main
```

完成浏览器登录或授权（如果出现），等待命令成功结束。**这一步才触发两端发布。**

如果出现推送被拒绝，不要使用 `--force`。看下一节的排错方法。

### 10.7 等两端部署完成

| 平台 | 去哪里查看 |
| --- | --- |
| Azure | [仓库 Actions](https://github.com/xboor/OpcciiBlog/actions)，工作流名 `Deploy Azure backup` |
| Cloudflare | Dashboard → Workers & Pages → **Pages 项目 `opcciiblog`** → Deployments |

账号中可能还有同名的旧 Worker，不要把它的失败记录当作 Pages 的发布结果。Cloudflare 的主站是 Pages 项目。

等待对应提交的部署成功后，分别访问：

- 主站：[opccii.com](https://opccii.com/)
- 备用站：[backup.opccii.com](https://backup.opccii.com/)

两端发布时间不一定完全一致。网页没更新时，先确认部署对应的是本次提交，再尝试强制刷新浏览器，不要只看一次页面就认为代码没提交。

日常发布不需要登录 Azure CLI，不需要用 Wrangler 上传，也不用手动复制 `dist`。Azure 当前工作流已设置 `PUBLIC_DEPLOY_TARGET=backup`，不要把它改成 `main`。

### 10.8 只想用 VS Code 的按钮提交

1. 写完后保存，仍先在终端执行构建、预览。
2. 点左侧“源代码管理”（分支形状的图标）。
3. 点开每个修改查看差异。
4. 对确定要发布的文件点 `+`，加入“暂存的更改”。
5. 输入提交说明，点“提交”。
6. 在当前分支为 `main` 且远程正确的前提下，使用“推送”。
7. “同步更改”通常还包含拉取操作；不理解冲突时不要连续盲点。

界面的“暂存、提交、推送”分别对应 `git add`、`git commit`、`git push`。用按钮不会跳过构建检查。

## 11. 修改、撤下、删除与恢复

### 11.1 更新已发布文章

打开原来的 `.mdx`，改正文或标题。实质性更新可填写比发布时间更晚的 `modDatetime`。尽量保留文件名，避免已有网址变化。

然后仍然是“构建 → 预览 → add → commit → push”。标签、摘要、精选状态也按这个流程更新。

### 11.2 暂时撤下文章

把 `draft` 改成 `true` 并重新发布，会从博客页面中排除这篇文章，但不会删除 GitHub 原稿及历史，也不能保证搜索引擎立即移除缓存。

### 11.3 删除文章

在 VS Code 删除对应文件，构建并提交这次删除。旧文章网址将不再正常提供原文，别人收藏的链接也会受到影响。先确认自己确实要删除，必要时先在仓库外保存副本。

### 11.4 文件加错暂存区，但还没 commit

例如把不想提交的文章加入了暂存区，可以执行：

```powershell
git restore --staged src/content/posts/my-first-note.mdx
```

这只取消暂存，保留工作区里的文件内容。之后重新检查并选择正确文件。

### 11.5 已发布的修改需要撤销

先查看历史：

```powershell
git log --oneline -5
```

对只包含本次目标修改的提交，可以使用 `git revert` 生成一个反向提交，再构建验证后推送。例如把下面的示意哈希换成实际提交：

```powershell
git revert --no-edit abc1234
pnpm build
git push origin main
```

**不要照抄 `abc1234`，不要随意撤销合并提交或包含其他工作内容的提交。** 如果出现冲突，保留现场再处理；工作区不干净时先别开始撤销。

新手不要用 `git reset --hard`、`git clean -fd` 或 `git push --force` 解决一般问题，它们可能丢失文件或改写远程历史。

## 12. 常见问题与处理顺序

| 现象 | 优先检查什么 |
| --- | --- |
| 提示找不到 `package.json` | 终端是不是在 `E:\blog\astro\AstroBlog`，而不是它的上一级 |
| 找不到 `pnpm` 或 `node` | 工具是否安装、安装后终端是否重新打开 |
| `pnpm.ps1` 不能运行 | 尝试 `pnpm.cmd build` 等命令 |
| 找不到 `astro` 等依赖 | 在项目根目录执行 `pnpm install` |
| `git` 说不是仓库 | 是否打开了 clone 下来的项目，而不是下载 ZIP 后的文件夹 |
| `Author identity unknown` | 按第 9 节配置提交者名字和邮箱 |
| 文章不显示 | 文件位置、扩展名、`draft`、发布日期；dev 和生产的日期规则不同 |
| frontmatter 构建失败 | 英文冒号、引号、日期格式、必填字段；从第一条实际错误看起 |
| SmartImage 构建报错 | `key` 是否在 `src/data/images.json` 中登记 |
| 图片白块或坏图 | 图片文件是否真实存在，路径是否漏提交，URL 是否为可访问直链 |
| 本地保存后预览不变 | `preview` 使用上次构建结果；重新 `build` 后再预览 |
| 本地文章有了但搜不到 | 是否重新构建生成 Pagefind 索引，是否在生产预览测试 |
| 评论区不显示 | 本地或平台是否具备四项 giscus 配置；不要重复安装或修改 App 权限来碰运气 |
| `nothing to commit` | 文件是否保存、是否真的有改动、是否已经提交过 |
| `no changes added to commit` | 是否对实际修改执行了 `git add` |
| `non-fast-forward` 或远程有新提交 | 先保护本地工作，再同步；不要强推 |
| `LF will be replaced by CRLF` | 通常是 Windows 换行提示，本身不代表构建失败 |
| 页面还显示旧版 | 是否 push 到正确仓库的 `main`；对应平台本次部署是否成功；浏览器是否缓存 |

### 推送被拒绝时

先执行 `git status`。如果工作区干净，可以尝试：

```powershell
git pull --ff-only origin main
```

如果提示无法 fast-forward，说明本地和远程各有新提交，不要反复执行。先阅读差异、决定如何合并；初学者可以把 `git status` 和错误信息交给维护者协助。不要粘贴凭据或部署令牌。

### 构建失败时

查看终端中第一条具体错误及其文件名、行号。最后的 “exit code 1” 通常只是结果。不要通过删除文章正文、跳过类型检查或更改部署架构来掩盖错误。

Pagefind 提示中文不支持 stemming（词干还原）是已知提示，不等于构建失败。仍应实际搜索中文测试。

## 13. 发布前检查表

- [ ] 文件确实保存为 `.mdx`，放在 `src/content/posts/`。
- [ ] `title`、`description`、`pubDatetime` 已填写，日期与时区正确。
- [ ] 需要公开时 `draft: false`；没有误用未来日期。
- [ ] 标签数量适当，没有同义标签重复堆积。
- [ ] 文章图片、清单条目和 `key` 对得上；图片在页面上真实显示。
- [ ] 没有把私密内容、账号密码、API Token 放入公开文件。
- [ ] `pnpm build` 成功，生产预览中的链接、公式、代码和手机阅读正常。
- [ ] `git diff --cached` 只包含这次准备发布的文件。
- [ ] 正确推送到 `xboor/OpcciiBlog` 的 `main`。
- [ ] Cloudflare Pages 和 Azure 的本次部署均成功，两个站点实际访问正常。

## 14. 日常速查卡

### 无图片的新文章

先在 VS Code 创建并保存 `src/content/posts/your-post-name.mdx`，填写 frontmatter 和正文。

```powershell
Set-Location 'E:\blog\astro\AstroBlog'
pnpm build
pnpm preview
```

浏览器确认后，回终端按 `Ctrl+C`，再执行：

```powershell
git status
git add src/content/posts/your-post-name.mdx
git diff --cached
git commit -m "post: 这里填写实际文章标题"
git push origin main
```

把 `your-post-name` 换成真实文件名。有图片时还要暂存对应图片和清单。

### 改“关于本站”

编辑 `src/content/pages/about.md` → 构建、预览 → 暂存这个文件 → commit → push。

### 改网站名字

编辑 `astro-paper.config.ts` 的 `site.title` → 构建、预览 → 暂存这个文件 → commit → push。

### 改新版首页介绍

编辑 `src/i18n/lang/zh.ts` 的 `home` → 构建、预览 → 暂存这个文件 → commit → push。

### 想查看更详细规范

- [文章规范：frontmatter、公式、图片与 MDX](../AGENTS/writing-guide.md)
- [项目禁止事项](../AGENTS/constraints.md)
- [部署与环境变量](../AGENTS/deployment.md)
- [故障排查](../AGENTS/troubleshooting.md)
- [GitHub 官方 Git 入门](https://docs.github.com/en/get-started/git-basics/set-up-git)
- [Git 官方首次配置说明](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)

建议先做一次最小练习：发布一篇只有标题、摘要和两个段落的文章。完整走通流程后，再加入图片、代码和公式。

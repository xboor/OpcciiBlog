# 排错与已知坑

> 项目版本：v1.1

## 症状 → 原因 → 处理

### 1. 写了文章但访问不到

**原因（最常见）**：`pubDatetime` 是未来时间，被当作「定时发布」而跳过。
判定阈值是「当前时间 + 15 分钟」。

**处理**：把 `pubDatetime` 改成过去的时间，重新 `pnpm build`。

其他可能：`draft: true`（草稿隔离）；文件名以 `_` 开头（被集合 glob 忽略）。

---

### 2. 文章能打开，但正文是空的

**原因**：`keystatic.config.ts` 里设置了 `format: { contentField: "content" }`，
正文被写进了 frontmatter，而主题读取的是文件 body。

**处理**：删掉该配置，改成普通 `fields.mdx({ label: "正文" })`。
并检查文章文件的 frontmatter 里是否已经混入了正文，需要手工挪回 body。
详见 [constraints.md](./constraints.md) 第 1 条。

---

### 3. `pnpm build` 在自动化沙箱里失败（遥测/权限错误）

**原因**：`astro build` 需要写 `C:\Users\<用户名>\AppData\Roaming\astro`（遥测与缓存），
受限沙箱会拦截这个路径。

**处理**：**在沙箱外**执行构建命令。CI（GitHub Actions）不受影响。

---

### 4. `pnpm build` 报 `cp` 相关错误 / `-r` 参数无效

**原因**：上游主题的 build 脚本用了 `cp -r`，在 Windows PowerShell 下 `cp` 是
`Copy-Item` 的别名、不支持 `-r`。

**处理**：本项目已改为 `node scripts/copy-pagefind.mjs`。若发现该行被还原，改回来即可。

---

### 5. 端口 4321 被占用

**原因**：上一次的 dev server 没退干净。

**处理**：结束残留的 node 进程后重跑 `pnpm dev`：

```powershell
Get-NetTCPConnection -LocalPort 4321 | Select-Object OwningProcess
Stop-Process -Id <PID>
```

---

### 6. `astro check` 报类型错误，但代码看着没问题

**原因**：改了 `src/content.config.ts` 或 `keystatic.config.ts` 之后，生成的类型没更新。

**处理**：跑 `pnpm sync` 重新生成类型，再 `pnpm build`。

---

### 7. Pagefind 提示 `doesn't support stemming for the language zh`

**这是正常的**，不是错误。Pagefind 对中文不做词干还原，**整词搜索仍然可用**。

如果 `/search/` 完全搜不到东西，按顺序排查：

1. `dist/pagefind/` 是否存在（`pnpm build` 会生成）
2. `public/pagefind/` 是否存在（脚本会复制回，dev 依赖它）
3. 文章页 `<main>` 上是否有 `data-pagefind-body`（Pagefind 只索引带该标记的页面）

---

### 8. 评论区不显示

giscus 四项变量**缺任意一项**都会让整块不渲染（静默，不报错）。逐项确认：

- `.env` 里 4 个 `PUBLIC_GISCUS_*` 都填了
- 仓库是 **public**
- 仓库已开启 **Discussions**，且分类 ID 与名称匹配
- 部署平台上是否也配置了这些变量（**`.env` 不会自动同步到平台**）

---

### 9. 图片显示为坏图

- **构建期报错**「SmartImage: 未找到图片」→ `key` 没在 `src/data/images.json` 里登记
- **运行期坏图** → 主地址与全部 `fallbacks` 都失效。换 `images.json` 里的 URL，不用动正文
- **发现没有自动切换** → 检查 `img` 上是否有 `data-fallback-chain` 属性

---

### 10. OG 图预览里中文标题变成方块

**原因**：开启了 `dynamicOgImage`，内置生成器只有拉丁字体。

**处理**：保持 `dynamicOgImage: false`，使用 `public/default-og.jpg`，
或给文章指定 `ogImage`（第三方图床 URL 亦可）。

---

### 11. 备用站出现了 sitemap

**原因**：部署平台没把 `PUBLIC_DEPLOY_TARGET` 设为 `backup`，或 Azure 自动生成的
工作流自行构建时未传递该变量。

**处理**：在对应平台的构建环境变量里补上 `PUBLIC_DEPLOY_TARGET=backup`，
并在 Azure 工作流的构建步骤中显式传入。

---

### 12. 站点上线后搜索无结果 / 样式丢失

**原因**：多半是产物没上传完整。注意 `public/pagefind/` 是构建产物的中转目录，
**不要手动删除或提交它**——`pnpm build` 会自行维护。

---

## 通用排查手段

```bash
pnpm build          # 1. 先确认构建通过（含类型检查）
pnpm preview        # 2. 本地跑真实产物
```

浏览器层面：打开 DevTools 看 Console 报错与 Network 失败请求（404 常指向资源路径问题）。

**中文内容相关的功能（搜索、评论）必须在真实浏览器里点一遍**，
HTTP 200 只能证明页面存在，不能证明脚本正常。

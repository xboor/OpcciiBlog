# 硬约束与禁忌

**改任何代码前必读。** 这里每一条都对应一个已经踩过的坑或已定型的决策，
违反会导致构建失败、内容丢失或 SEO 受损。

---

## 1. 绝不设置 Keystatic 的 `format.contentField`

```ts
// ❌ 绝对不要
format: { contentField: "content" },
```

**后果**：正文会被写进 frontmatter，而 AstroPaper 读取的是文件正文（body），
结果是**文章内容为空**。

**正确做法**：用 `fields.mdx({ label: "正文" })` 作为普通字段，让它自然落到文件 body。

---

## 2. `keystatic.config.ts` 必须与 `src/content.config.ts` 对齐

- 两边的**字段名**要一致（`title` / `description` / `pubDatetime` / `modDatetime` /
  `tags` / `featured` / `draft` / `author` / `ogImage` / `canonicalURL` /
  `hideEditPost` / `timezone` / `content`）
- 日期字段两边都必须是 **datetime 类型**
- 不一致时：后台能保存，但 Astro 集合校验会失败，构建报错

修改任一边后，务必跑一次 `pnpm build` 验证。

---

## 3. `site.url` 恒定为主域名

`site.url` 是 canonical / RSS / sitemap 的**唯一来源**，永远指向主域（Cloudflare）。

备用站（Azure）的处理方式是：

- canonical 指向主域
- **不做 `noindex`**（保留可访问性与兜底收录）
- 不生成 sitemap，`robots.txt` 也不指向 sitemap

这比 noindex 更稳健：既避免与主站抢排名，又保证主站挂掉时备站还能被访问。

---

## 4. 不要开启 `dynamicOgImage`

内置的 OG 图生成器只打包了**拉丁字体**，中文标题会渲染成方块。
用 `public/default-og.jpg` 作默认图，或每篇用 `ogImage` 字段指定。

---

## 5. `public/default-og.jpg` 必须存在

`dynamicOgImage: false` 时构建会校验该文件，缺失直接构建失败。

---

## 6. 不要再引入 Web 字体（`Font` 组件）

主题的字体已从 Google Web 字体改为**系统字体栈**（含 PingFang SC / Microsoft YaHei /
Noto Sans SC 等中文字体）：

- 更快（无外部请求）
- 中文渲染正常（原 Web 字体只有拉丁字形）

---

## 7. Keystatic 只在 dev 下挂载

见 `astro.config.ts`：

```ts
const isDev = process.env.NODE_ENV === "development";
integrations: [mdx(), ..., ...(isDev ? [react(), keystatic()] : [])]
```

**不要**把它改成无条件挂载，否则生产构建会引入 React 与服务端运行时，
破坏 `output: static` 的纯静态产物。

---

## 8. 不要让备用站生成 sitemap

靠 `PUBLIC_DEPLOY_TARGET=backup` 控制，逻辑在 `astro.config.ts` 与
`src/pages/robots.txt.ts`。**不要**去掉这些判断，否则两个域名会互相抢收录。

---

## 9. 不要给 `mdx()` 重复挂 remark/rehype 插件

数学、callout 等插件统一挂在 `markdown.processor`，MDX 会自动继承。
重复挂载会导致公式被处理两次、输出错乱。

---

## 10. 图片走清单，不散落 URL

正文图片统一用 `<SmartImage key="..." />` + `src/data/images.json`，
以获得备用图床自动切换能力。**key 不存在时构建会直接报错**，这是刻意的保护。

---

## 11. Windows 下不要用 `cp -r`

PowerShell 里 `cp` 是 `Copy-Item` 的别名、不支持 `-r`。构建脚本已改为
`node scripts/copy-pagefind.mjs`。跨平台脚本一律用 Node API 或明确的可执行文件。

---

## 12. 不要提交 `dist/` 与 `public/pagefind/`

两者都已在 `.gitignore` 中。`public/pagefind` 是构建产物（由脚本自动复制回），
提交它会污染仓库。

---

## 13. Cloudflare Pages 项目**不能**用 CLI 创建

Cloudflare 官方限制：**Git 集成与"直接上传"两种项目类型创建后不可互转**。

- ❌ 不要用 `wrangler pages project create` 建站点项目 → 建成"直接上传"类型，
  从此**永久无法**接入 Git 自动部署，只能删掉重建
- ✅ 必须在 dashboard 通过 **Connect to Git** 创建
- `wrangler pages deploy` 只适合临时验证；生产项目不要用它创建

同理，`wrangler` 也没有绑定自定义域名与操作 DNS 记录的子命令 —— 那些只能在
dashboard 完成（或走带 `dns:write` 的 API Token）。

---

## 14. 不要动 `a.opccii.com`

该子域由另一个 Pages 项目 `sink-cf` 使用（实测有正常解析记录）。改 DNS 时只碰
`opccii.com` 与 `backup.opccii.com`，不要批量清理区域内的记录。

---

## 速查：允许 vs 禁止

| 允许 | 禁止 |
| --- | --- |
| 手写 `.mdx` | 用 `contentField` 存正文 |
| 直接写 `<img>`（无兜底） | 正文里散落图床 URL |
| 改 `src/i18n/lang/*.ts` 文案 | 在组件里硬编码中文 |
| 在 dev 下用 Keystatic | 把 Keystatic 挂到生产构建 |
| 每篇指定 `ogImage` URL | 开启 `dynamicOgImage` |
| dashboard 里 Connect to Git | 用 `wrangler` 创建生产 Pages 项目 |
| 只改 `opccii.com` / `backup.opccii.com` | 批量清理区域 DNS（会破坏 `a.opccii.com`） |

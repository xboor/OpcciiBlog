import { config, fields, collection } from "@keystatic/core";

// 仅用于本地写作（`pnpm dev` 下访问 /keystatic），不参与生产构建。
// 注意：不要设置 format.contentField，否则正文会被写进 frontmatter，
// 而 AstroPaper 主题读取的是文件正文（body），会导致文章内容为空。
export default config({
  storage: {
    kind: "local",
  },
  ui: {
    brand: { name: "博客后台" },
  },
  collections: {
    posts: collection({
      label: "文章",
      slugField: "title",
      path: "src/content/posts/*",
      entryLayout: "content",
      columns: ["title", "pubDatetime"],
      schema: {
        title: fields.slug({
          name: { label: "标题" },
          slug: { label: "文件名（URL 中的 slug）", description: "中文标题建议手动填写英文 slug" },
        }),
        description: fields.text({
          label: "摘要",
          description: "用于 SEO 与列表展示，必填",
          multiline: true,
        }),
        pubDatetime: fields.datetime({
          label: "发布时间",
          description: "未来时间会被视为「定时发布」，到点前不显示",
        }),
        modDatetime: fields.datetime({
          label: "更新时间（可选）",
          validation: { isRequired: false },
        }),
        tags: fields.array(fields.text({ label: "标签" }), {
          label: "标签",
          itemLabel: props => props.value || "新标签",
        }),
        featured: fields.checkbox({ label: "精选" }),
        draft: fields.checkbox({ label: "草稿" }),
        author: fields.text({ label: "作者", defaultValue: "博主" }),
        ogImage: fields.text({
          label: "OG 图片 URL（可选）",
          description: "第三方图床的完整 URL；留空则使用站点默认 OG 图",
        }),
        canonicalURL: fields.text({ label: "Canonical URL（可选）" }),
        hideEditPost: fields.checkbox({ label: "隐藏「编辑此页」链接" }),
        timezone: fields.text({ label: "时区（可选）", description: "如 Asia/Shanghai" }),
        content: fields.mdx({
          label: "正文",
          options: {
            image: {
              directory: "src/assets/images/posts",
              publicPath: "../../assets/images/posts/",
            },
          },
        }),
      },
    }),
    pages: collection({
      label: "页面",
      slugField: "title",
      path: "src/content/pages/*",
      entryLayout: "content",
      schema: {
        title: fields.slug({ name: { label: "标题" } }),
        description: fields.text({
          label: "描述（可选）",
          validation: { isRequired: false },
          multiline: true,
        }),
        content: fields.mdx({ label: "正文" }),
      },
    }),
  },
});

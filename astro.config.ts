import { defineConfig, envField, svgoOptimizer } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import keystatic from "@keystatic/astro";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeCallouts from "rehype-callouts";
import rehypeKatex from "rehype-katex";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

// Keystatic 只在本地开发（astro dev）时挂载，生产构建不引入，保证 `output: static`。
const isDev = process.env.NODE_ENV === "development";

// 备用站（Azure）不生成 sitemap，避免与主域（Cloudflare）重复收录。
// 通过环境变量 PUBLIC_DEPLOY_TARGET=backup 切换。
const isBackupSite = process.env.PUBLIC_DEPLOY_TARGET === "backup";

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    ...(isBackupSite
      ? []
      : [
          sitemap({
            filter: page =>
              config.features?.showArchives !== false ||
              !page.endsWith("/archives/"),
          }),
        ]),
    ...(isDev ? [react(), keystatic()] : []),
  ],
  i18n: {
    locales: ["zh", "en"],
    defaultLocale: "zh",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        // remark-math 需在其它 remark 插件之前解析 $...$ / $$...$$
        remarkMath,
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts, rehypeKatex],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      // "main"（默认，Cloudflare 主域）| "backup"（Azure 备用站）
      PUBLIC_DEPLOY_TARGET: envField.enum({
        access: "public",
        context: "client",
        values: ["main", "backup"],
        default: "main",
      }),
      // Cloudflare Web Analytics beacon token
      PUBLIC_CF_ANALYTICS_TOKEN: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      // giscus 评论（GitHub Discussions）
      PUBLIC_GISCUS_REPO: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_GISCUS_REPO_ID: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_GISCUS_CATEGORY: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_GISCUS_CATEGORY_ID: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});

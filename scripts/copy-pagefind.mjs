// 构建后把 pagefind 索引从 dist 复制到 public，
// 这样下次 `astro build` 才会把索引一起打进产物，dev 下搜索也能用。
// 用 Node 实现，避免依赖 Unix 的 `cp -r`（Windows PowerShell 下会失败）。
import { cpSync, existsSync, rmSync } from "node:fs";

const src = "dist/pagefind";
const dest = "public/pagefind";

if (!existsSync(src)) {
  console.error(`[copy-pagefind] 未找到 ${src}，请先运行 pagefind --site dist`);
  process.exit(1);
}

// public/pagefind 是构建产物目录（已在 .gitignore 中忽略），可安全重建
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });

console.log(`[copy-pagefind] 已复制 ${src} -> ${dest}`);

import manifest from "@/data/images.json";

export interface ImageEntry {
  /** 主图床地址 */
  primary: string;
  /** 备用图床地址，按顺序尝试 */
  fallbacks?: string[];
}

/**
 * 从 src/data/images.json 按 key 解析出「主地址 + 备用地址」列表。
 * 返回 null 表示该 key 不存在。
 */
export function resolveImage(key: string): string[] | null {
  const entry = (manifest as Record<string, ImageEntry>)[key];
  if (!entry?.primary) return null;
  return [entry.primary, ...(entry.fallbacks ?? [])];
}

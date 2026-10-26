import { getCollection } from "astro:content";
import { getPostSlug } from "@/utils/getPostPaths";
import { getSortedPosts } from "@/utils/getSortedPosts";

import type { CollectionEntry } from "astro:content";
import type { APIRoute } from "astro";

export async function getStaticPaths() {
  const posts = getSortedPosts(await getCollection("posts"));

  return posts.map(post => ({
    params: { slug: getPostSlug(post.id, post.filePath) },
    props: { post },
  }));
}

type Props = { post: CollectionEntry<"posts"> };

function toFrontmatter(post: CollectionEntry<"posts">): string {
  const { title, description, pubDatetime, modDatetime, tags } = post.data;
  return [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `pubDatetime: ${pubDatetime.toISOString()}`,
    ...(modDatetime ? [`modDatetime: ${modDatetime.toISOString()}`] : []),
    `tags: ${JSON.stringify(tags ?? [])}`,
    "---",
  ].join("\n");
}

/** 输出文章 Markdown 原文，供 AI Agent / 工具直接抓取。 */
export const GET: APIRoute = ({ props }) => {
  const { post } = props as Props;
  const markdown = `${toFrontmatter(post)}\n\n${post.body ?? ""}\n`;
  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};

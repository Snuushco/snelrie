import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  keywords: string[];
  ogImage?: string;
  content: string;
  htmlContent?: string;
}

export function getAllPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      return {
        slug: data.slug || fileName.replace(/\.md$/, ""),
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        keywords: data.keywords || [],
        ogImage: data.ogImage,
        content,
      } as BlogPost;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html, { sanitize: false }).process(markdown);
  return result.toString();
}

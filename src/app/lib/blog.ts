export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
}

const rawFiles = import.meta.glob("../../content/blog/*.{md,txt}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string): string {
  return path.split("/").pop()!.replace(/\.(md|txt)$/, "");
}

function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parsePost(path: string, raw: string): BlogPost {
  const slug = slugFromPath(path);
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  const data: Record<string, string> = {};
  let body = raw.trim();

  if (match) {
    const [, frontmatter, rest] = match;
    for (const line of frontmatter.split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    body = rest.trim();
  }

  const firstLine = body.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";

  return {
    slug: data.slug || slug,
    title: data.title || titleFromSlug(slug),
    date: data.date || "",
    tags: data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    excerpt: data.excerpt || firstLine.replace(/^#+\s*/, ""),
    content: body,
  };
}

const posts: BlogPost[] = Object.entries(rawFiles)
  .map(([path, raw]) => parsePost(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

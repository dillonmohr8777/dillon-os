import type { MetadataRoute } from "next";
import { nav, business } from "@/lib/site";
import { blogPosts } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${business.domain}`;
  const extra = ["/book-a-service", ...blogPosts.map((post) => `/blog/${post.slug}`)];
  const routes = [...new Set([...nav.map((n) => n.href), ...extra])];
  return routes.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

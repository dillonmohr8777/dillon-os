import type { Metadata } from "next";
import { business } from "@/lib/site";

const siteUrl = `https://${business.domain}`;
const defaultSocialImage = {
  url: "/img/logo.png",
  width: 512,
  height: 278,
  alt: `${business.name} official logo`,
};

function canonicalPath(path: string) {
  if (path === "/") return "/";
  return `${path.replace(/\/$/, "")}/`;
}

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = canonicalPath(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: business.name,
      locale: "en_US",
      type: "website",
      images: [defaultSocialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultSocialImage.url],
    },
  };
}

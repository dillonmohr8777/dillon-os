import type { Metadata } from "next";
import { business } from "@/lib/site";

const siteUrl = `https://${business.domain}`;
const defaultSocialImage = {
  url: "/img/mascot.jpg",
  width: 1400,
  height: 788,
  alt: `${business.name} mascot and brand mark`,
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
  image = defaultSocialImage.url,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const canonical = canonicalPath(path);
  const socialImage = { ...defaultSocialImage, url: image };

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
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}


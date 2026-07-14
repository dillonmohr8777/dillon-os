import type { MetadataRoute } from "next";
import { business } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: business.name,
    short_name: business.shortName,
    description: "Residential heating, cooling, indoor air quality, and emergency HVAC service in Hampshire, Illinois.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070b",
    theme_color: "#f47a20",
    lang: "en-US",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

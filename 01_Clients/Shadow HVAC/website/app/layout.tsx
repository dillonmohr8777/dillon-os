import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { AmbientWorkRail } from "@/components/AmbientWorkRail";
import { NetlifyForms } from "@/components/NetlifyForms";
import { business } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const homeMetadata = createPageMetadata({
  title: `${business.name}: ${business.tagline}`,
  description:
    "Residential HVAC service for Hampshire, IL and surrounding areas. Heating, cooling, indoor air quality, and 24/7 emergency repair. Fast Response. No Fumbles.",
  path: "/",
});

export const metadata: Metadata = {
  ...homeMetadata,
  metadataBase: new URL(`https://${business.domain}`),
  title: {
    default: `${business.name}: ${business.tagline}`,
    template: `%s | ${business.name}`,
  },
  keywords: [
    "HVAC Hampshire IL",
    "furnace repair Hampshire",
    "AC repair Kane County",
    "emergency HVAC",
    "heating and cooling Hampshire IL",
    "Shadow Heating & Cooling",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="min-h-screen antialiased">
        <StructuredData />
        <NetlifyForms />
        <Navbar />
        <main>{children}</main>
        <AmbientWorkRail />
        <Footer />
      </body>
    </html>
  );
}

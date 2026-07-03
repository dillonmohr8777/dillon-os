import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { business } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL(`https://${business.domain}`),
  title: {
    default: `${business.name} — ${business.tagline}`,
    template: `%s | ${business.name}`,
  },
  description:
    "Residential HVAC service for Hampshire, IL and surrounding areas. Heating, cooling, indoor air quality, and 24/7 emergency repair. Fast Response. No Fumbles.",
  keywords: [
    "HVAC Hampshire IL",
    "furnace repair Hampshire",
    "AC repair Kane County",
    "emergency HVAC",
    "heating and cooling Hampshire IL",
    "Shadow Heating & Cooling",
  ],
  openGraph: {
    title: `${business.name} — ${business.tagline}`,
    description:
      "24/7 residential HVAC in Hampshire, IL and Kane County. Heating, cooling, air quality, and emergency service.",
    url: `https://${business.domain}`,
    siteName: business.name,
    type: "website",
  },
  robots: { index: true, follow: true },
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
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

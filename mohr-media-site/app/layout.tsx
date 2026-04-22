import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mohr Media | AI-Powered Marketing Systems",
  description:
    "We build AI-powered marketing systems that generate leads, drive revenue, and actually compound.",
  metadataBase: new URL("https://mohrmedia.com"),
  openGraph: {
    title: "Mohr Media",
    description:
      "AI-powered marketing infrastructure built by an operator who runs 25+ client accounts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

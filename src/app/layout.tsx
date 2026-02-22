import type { Metadata } from "next";
import { Assistant, Playfair_Display } from "next/font/google";
import { getUserFromCookies } from "@/lib/auth";
import { getSiteUrl } from "@/lib/siteUrl";
import AppChrome from "./AppChrome";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-assistant",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const siteUrl = getSiteUrl() || "https://anjelatroya.co.il";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ANJELA TROYA | תיווך נדל\"ן באשקלון",
  description: "שירותי תיווך נדל\"ן מקצועיים באשקלון — ליווי אישי, אמינות ושקיפות מלאה.",
  openGraph: {
    title: "ANJELA TROYA | תיווך נדל\"ן באשקלון",
    description: "שירותי תיווך נדל\"ן מקצועיים באשקלון — ליווי אישי, אמינות ושקיפות מלאה.",
    type: "website",
    url: siteUrl,
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserFromCookies();
  const isAdmin = user?.role === "ADMIN";
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${assistant.variable} ${playfair.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <AppChrome isAdmin={isAdmin}>{children}</AppChrome>
      </body>
    </html>
  );
}

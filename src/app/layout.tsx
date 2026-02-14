import type { Metadata } from "next";
import { Assistant, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { getUserFromCookies } from "@/lib/auth";
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

export const metadata: Metadata = {
  title: "ANJELA TROYA | נדל\"ן ושמאות",
  description: "שירותי תיווך ושמאות נדל\"ן מקצועיים בישראל.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserFromCookies();
  const isAdmin = user?.role === "ADMIN";
  const store = await headers();
  const nonce = store.get("x-nonce") ?? undefined;

  return (
    <html lang="he" dir="rtl">
      <body
        nonce={nonce}
        className={`${assistant.variable} ${playfair.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <AppChrome isAdmin={isAdmin}>{children}</AppChrome>
      </body>
    </html>
  );
}

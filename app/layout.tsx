import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { HTML_LANG, t } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: t.app.name,
  description: t.app.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={HTML_LANG}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-ring"
        >
          {t.app.skipToContent}
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

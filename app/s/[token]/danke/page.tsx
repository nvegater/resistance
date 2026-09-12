import type { Metadata } from "next";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: t.thanks.title };

export default function ThankYouPage() {
  return (
    <main id="inhalt" className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t.thanks.title}</h1>
        <p className="max-w-prose text-base text-muted-foreground">{t.thanks.text}</p>
      </div>
    </main>
  );
}

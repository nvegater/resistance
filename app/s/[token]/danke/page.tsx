import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vielen Dank" };

export default function ThankYouPage() {
  return (
    <main id="inhalt" className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Vielen Dank</h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Ihre Antworten sind angekommen. Sie können dieses Fenster jetzt schließen.
        </p>
      </div>
    </main>
  );
}

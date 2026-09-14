"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fill, t } from "@/lib/i18n";

/** The public link with a copy button and a QR code to scan on a phone. */
export function SharePanel({
  url,
  title,
  linkLabel = t.share.linkLabel,
  hint = t.share.hint,
}: {
  url: string;
  title: string;
  /** What the link opens. The default names the survey; a leader survey names its form. */
  linkLabel?: string;
  /** Who should receive the link. */
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex-1 space-y-2">
        <Label htmlFor="share-url">{linkLabel}</Label>
        <div className="flex gap-2">
          <Input id="share-url" readOnly value={url} className="h-10 font-mono text-xs" />
          <CopyButton value={url} label={t.share.copyLink} />
        </div>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      <figure className="flex flex-col items-center gap-1">
        <div className="rounded-lg border bg-white p-2">
          <QRCodeSVG
            value={url}
            size={112}
            level="M"
            title={fill(t.share.qrTitle, { title })}
          />
        </div>
        <figcaption className="text-xs text-muted-foreground">{t.share.qrCaption}</figcaption>
      </figure>
    </div>
  );
}

export function CopyButton({
  value,
  label,
  variant = "outline",
}: {
  value: string;
  label: string;
  variant?: "outline" | "secondary" | "default";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(fill(t.app.copiedToClipboard, { label }));
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant={variant} size="lg" onClick={copy}>
      {copied ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}

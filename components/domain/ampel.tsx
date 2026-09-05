import { cn } from "@/lib/utils";
import { AMPEL_ICON, AMPEL_PHASE, type Ampel } from "@/lib/domain/mapping";

/**
 * The colours for one Ampel value. Colour never carries the meaning on its own:
 * every badge also shows the word ROT, GELB or GRÜN and an icon.
 */
export const AMPEL_STYLE: Record<
  Ampel,
  { text: string; bg: string; border: string; chart: string }
> = {
  ROT: {
    text: "text-ampel-rot",
    bg: "bg-ampel-rot-bg",
    border: "border-ampel-rot",
    chart: "var(--ampel-rot-mark)",
  },
  GELB: {
    text: "text-ampel-gelb",
    bg: "bg-ampel-gelb-bg",
    border: "border-ampel-gelb",
    chart: "var(--ampel-gelb-mark)",
  },
  "GRÜN": {
    text: "text-ampel-gruen",
    bg: "bg-ampel-gruen-bg",
    border: "border-ampel-gruen",
    chart: "var(--ampel-gruen-mark)",
  },
};

export function AmpelBadge({
  ampel,
  className,
  withPhase = false,
}: {
  ampel: Ampel;
  className?: string;
  /** Adds the volcano phase, for example "ROT · Akute Eruption". */
  withPhase?: boolean;
}) {
  const style = AMPEL_STYLE[ampel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold",
        style.bg,
        style.border,
        style.text,
        className,
      )}
    >
      <span aria-hidden="true">{AMPEL_ICON[ampel]}</span>
      <span>
        {ampel}
        {withPhase ? ` · ${AMPEL_PHASE[ampel].phase}` : ""}
      </span>
    </span>
  );
}

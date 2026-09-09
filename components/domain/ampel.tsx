import { cn } from "@/lib/utils";
import { AMPEL_ICON, AMPEL_PHASE, type Ampel } from "@/lib/domain/mapping";

/**
 * The colours for one Ampel value. Colour never carries the meaning on its own:
 * every badge also shows the word ROT, GELB or GRÜN and an icon.
 *
 * GELB is a bright traffic-light yellow, which is too light to carry text. Its badge
 * therefore uses the normal dark text on the yellow and a darker ring around it, and
 * the yellow itself only appears as a fill.
 */
export const AMPEL_STYLE: Record<
  Ampel,
  {
    text: string;
    bg: string;
    border: string;
    /** Fill for chart marks and the volcano. */
    chart: string;
    /** Outline around such a fill, so the shape has an edge on the white page. */
    outline: string;
    /** The bright fill tone as a border class, for the coloured bar on a KPI card. */
    accent: string;
  }
> = {
  ROT: {
    text: "text-ampel-rot",
    bg: "bg-ampel-rot-bg",
    border: "border-ampel-rot",
    chart: "var(--ampel-rot-mark)",
    outline: "var(--ampel-rot)",
    accent: "border-ampel-rot-mark",
  },
  GELB: {
    text: "text-foreground",
    bg: "bg-ampel-gelb-bg",
    border: "border-ampel-gelb-border",
    chart: "var(--ampel-gelb-mark)",
    outline: "var(--ampel-gelb-border)",
    accent: "border-ampel-gelb-mark",
  },
  "GRÜN": {
    text: "text-ampel-gruen",
    bg: "bg-ampel-gruen-bg",
    border: "border-ampel-gruen",
    chart: "var(--ampel-gruen-mark)",
    outline: "var(--ampel-gruen)",
    accent: "border-ampel-gruen-mark",
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

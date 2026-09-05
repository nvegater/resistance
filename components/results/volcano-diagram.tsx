import { useId } from "react";

import { AMPEL_PHASE, type Ampel } from "@/lib/domain/mapping";
import type { AmpelCount } from "@/lib/domain/scoring";

/**
 * The volcano model drawn from the survey data instead of a fixed illustration.
 *
 * Two things are encoded. The magma chamber under the ground line is filled with
 * the participants, stacked by their Ampel value with ROT at the bottom, so the
 * band heights are the same numbers the donut and the table show. The rest of the
 * volcano shows the phase of the whole organization: how far the magma has risen
 * in the conduit, and what comes out of the crater. ROT erupts with a lava
 * fountain, GELB smokes, GRÜN stays quiet.
 */

const VIEW_WIDTH = 500;
const VIEW_HEIGHT = 336;

/** The line between the visible level (Zone 2) and the invisible one (Zone 1). */
const GROUND_Y = 170;

const CHAMBER_X = 155;
const CHAMBER_Y = 204;
const CHAMBER_W = 190;
const CHAMBER_H = 86;

/** Gap between two stacked bands, so they never need a border to be told apart. */
const BAND_GAP = 2;
/** A single participant still has to be visible, so every band keeps this much height. */
const BAND_MIN_H = 6;
/** Below this height a label inside the diagram would be cramped, so it is left out. */
const BAND_LABEL_MIN_H = 18;

const MOUNTAIN =
  "M 90 170 C 140 166, 190 148, 236 100 L 244 112 L 256 112 L 264 100 " +
  "C 310 148, 360 166, 410 170 Z";

const CONDUIT =
  "M 246 112 C 247 142, 245 172, 247 204 L 253 204 C 255 172, 253 142, 254 112 Z";

/** The ash cloud. GELB reuses it at a bit over half the size. */
const CLOUD =
  "M 244 96 C 238 74, 232 66, 224 60 C 212 52, 216 30, 230 30 " +
  "C 234 14, 256 10, 264 20 C 280 16, 292 32, 282 44 " +
  "C 292 54, 282 68, 270 62 C 260 70, 256 80, 254 96 Z";

/** The jets of the lava fountain: base x on the crater, then the tip. */
const FOUNTAIN = [
  { baseX: 238, tipX: 216, tipY: 86 },
  { baseX: 244, tipX: 232, tipY: 62 },
  { baseX: 250, tipX: 250, tipY: 46 },
  { baseX: 256, tipX: 268, tipY: 62 },
  { baseX: 262, tipX: 284, tipY: 86 },
];

/** Rock thrown out by an eruption. */
const SPRAY = [
  { cx: 278, cy: 88, r: 4 },
  { cx: 296, cy: 74, r: 3.5 },
  { cx: 222, cy: 86, r: 3.5 },
  { cx: 204, cy: 72, r: 3 },
];

/** Bottom to top, so the heaviest pressure sits at the bottom of the chamber. */
const STACK_ORDER: Ampel[] = ["ROT", "GELB", "GRÜN"];

const BAND_FILL: Record<Ampel, string> = {
  ROT: "fill-ampel-rot-mark",
  GELB: "fill-ampel-gelb-mark",
  "GRÜN": "fill-ampel-gruen-mark",
};

/** How high the magma stands in the conduit. One value per phase, not a measurement. */
const MAGMA_TOP: Record<Ampel, number> = { ROT: 108, GELB: 150, "GRÜN": 186 };

const CRATER_TEXT: Record<Ampel, string> = {
  ROT: "eine Eruption mit Lavafontäne, ausgeworfenem Gestein und einer Aschewolke",
  GELB: "eine kleine Rauchwolke über dem Krater",
  "GRÜN": "einen ruhigen Krater ohne Rauch",
};

type Band = AmpelCount & { y: number; height: number };

/**
 * Turns the counts into stacked band geometry. Every band that has participants
 * keeps a minimum height; the rest of the chamber is split by share, so the bands
 * always fill the chamber exactly.
 */
function layoutBands(counts: AmpelCount[], total: number): Band[] {
  const present = STACK_ORDER.map((ampel) =>
    counts.find((entry) => entry.ampel === ampel),
  ).filter((entry): entry is AmpelCount => entry !== undefined && entry.count > 0);

  if (present.length === 0 || total === 0) return [];

  const free =
    CHAMBER_H - (present.length - 1) * BAND_GAP - present.length * BAND_MIN_H;

  const bands: Band[] = [];
  let bottom = CHAMBER_Y + CHAMBER_H;

  for (const entry of present) {
    const height = BAND_MIN_H + (free * entry.count) / total;
    bottom -= height;
    bands.push({ ...entry, y: bottom, height });
    bottom -= BAND_GAP;
  }

  return bands;
}

export function VolcanoDiagram({
  phase,
  ampelCounts,
  total,
  className,
}: {
  /** The phase of the whole organization. Null renders the quiet state. */
  phase: Ampel | null;
  ampelCounts: AmpelCount[];
  total: number;
  className?: string;
}) {
  // useId can contain characters that are awkward inside url(#...), so only the
  // letters and digits are kept and every id in this diagram is built from them.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const titleId = `vulkan-titel-${uid}`;
  const descId = `vulkan-text-${uid}`;
  const chamberClipId = `vulkan-kammer-${uid}`;
  const conduitClipId = `vulkan-schlot-${uid}`;

  const bands = layoutBands(ampelCounts, total);
  const magmaTop = phase ? MAGMA_TOP[phase] : MAGMA_TOP["GRÜN"];

  const chamberText =
    bands.length > 0
      ? bands
          .map((band) => `${band.count} × ${band.ampel}`)
          .reverse()
          .join(", ")
      : "noch keine Teilnehmenden";

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className={className}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>
        {phase
          ? `Vulkanmodell: ${phase} · ${AMPEL_PHASE[phase].phase}`
          : "Vulkanmodell: noch keine Antworten"}
      </title>
      <desc id={descId}>
        {`Querschnitt durch einen Vulkan. Die Magmakammer unter der Erdoberfläche ist nach Ampelwerten gefüllt: ${chamberText}. Am Krater zeigt die Darstellung ${
          phase ? CRATER_TEXT[phase] : "einen ruhigen Krater ohne Rauch"
        }. Alle Zahlen stehen auch in der Tabelle daneben.`}
      </desc>

      <defs>
        {/* Cuts the coloured bands to the rounded shape of the chamber. */}
        <clipPath id={chamberClipId}>
          <rect x={CHAMBER_X} y={CHAMBER_Y} width={CHAMBER_W} height={CHAMBER_H} rx={8} />
        </clipPath>
        {/* Cuts the magma to the part of the conduit it has risen into. */}
        <clipPath id={conduitClipId}>
          <rect x={242} y={magmaTop} width={16} height={CHAMBER_Y - magmaTop} />
        </clipPath>
      </defs>

      {/* The ash cloud sits behind the mountain, so the crater cuts into it. */}
      {phase === "ROT" ? <path d={CLOUD} className="fill-muted-foreground/45" /> : null}
      {phase === "GELB" ? (
        <g transform="translate(250 112) scale(0.55) translate(-250 -112)">
          <path d={CLOUD} className="fill-muted-foreground/40" />
        </g>
      ) : null}

      {/* Everything below the ground line: the invisible level of the model. */}
      <rect
        x={0}
        y={GROUND_Y}
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT - GROUND_Y}
        className="fill-muted-foreground/10"
      />
      <path d={MOUNTAIN} className="fill-muted-foreground/20" />
      <line
        x1={0}
        y1={GROUND_Y}
        x2={VIEW_WIDTH}
        y2={GROUND_Y}
        className="stroke-muted-foreground"
        strokeWidth={1.5}
      />
      <path
        d={MOUNTAIN}
        className="fill-none stroke-muted-foreground"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* The conduit, empty first and then filled to the level of the phase. */}
      <path
        d={CONDUIT}
        className="fill-muted-foreground/10 stroke-muted-foreground"
        strokeWidth={1.5}
      />
      {phase ? (
        <path
          d={CONDUIT}
          clipPath={`url(#${conduitClipId})`}
          className={BAND_FILL[phase]}
        />
      ) : null}

      {/* What an erupting organization throws out. */}
      {phase === "ROT" ? (
        <>
          {SPRAY.map((stone) => (
            <circle
              key={`${stone.cx}-${stone.cy}`}
              cx={stone.cx}
              cy={stone.cy}
              r={stone.r}
              className="fill-ampel-rot-mark"
            />
          ))}
          {FOUNTAIN.map((jet) => (
            <path
              key={jet.baseX}
              d={`M ${jet.baseX - 4} 112 L ${jet.tipX} ${jet.tipY} L ${jet.baseX + 4} 112 Z`}
              className="fill-ampel-rot-mark"
            />
          ))}
        </>
      ) : null}

      {/* The magma chamber, filled with the participants. */}
      <rect
        x={CHAMBER_X}
        y={CHAMBER_Y}
        width={CHAMBER_W}
        height={CHAMBER_H}
        rx={8}
        className="fill-background stroke-muted-foreground"
        strokeWidth={1.5}
      />
      <g clipPath={`url(#${chamberClipId})`}>
        {bands.map((band) => (
          <rect
            key={band.ampel}
            x={CHAMBER_X}
            y={band.y}
            width={CHAMBER_W}
            height={band.height}
            className={BAND_FILL[band.ampel]}
          />
        ))}
      </g>
      <rect
        x={CHAMBER_X}
        y={CHAMBER_Y}
        width={CHAMBER_W}
        height={CHAMBER_H}
        rx={8}
        className="fill-none stroke-muted-foreground"
        strokeWidth={1.5}
      />

      {/* Pressure on the chamber. The legend beside the diagram names both arrows. */}
      <PressureArrow x={86} direction="up" sign="−" />
      <PressureArrow x={124} direction="down" sign="+" />

      {/* Short labels only. The full vocabulary stays in the legend as HTML,
          so it reflows and resizes like the rest of the page. */}
      <g className="hidden sm:block">
        <line
          x1={58}
          y1={128}
          x2={177}
          y2={142}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <text x={10} y={124} className="fill-muted-foreground" fontSize={15} fontWeight={500}>
          Zone 2
        </text>
        <line
          x1={58}
          y1={190}
          x2={153}
          y2={214}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
        <text x={10} y={186} className="fill-muted-foreground" fontSize={15} fontWeight={500}>
          Zone 1
        </text>

        {bands
          .filter((band) => band.height >= BAND_LABEL_MIN_H)
          .map((band) => {
            const centre = band.y + band.height / 2;
            return (
              <g key={band.ampel}>
                <line
                  x1={CHAMBER_X + CHAMBER_W}
                  y1={centre}
                  x2={CHAMBER_X + CHAMBER_W + 12}
                  y2={centre}
                  className="stroke-muted-foreground"
                  strokeWidth={1}
                />
                <text
                  x={CHAMBER_X + CHAMBER_W + 18}
                  y={centre}
                  dominantBaseline="middle"
                  className="fill-foreground"
                  fontSize={16}
                  fontWeight={600}
                >
                  {band.count} · {band.ampel}
                </text>
              </g>
            );
          })}
      </g>
    </svg>
  );
}

/**
 * One of the two pressure arrows of the model, both drawn left of the chamber.
 * The arrow pointing up carries a minus because it stands for Druckreduktion.
 */
function PressureArrow({
  x,
  direction,
  sign,
}: {
  x: number;
  direction: "up" | "down";
  sign: string;
}) {
  const from = direction === "up" ? 286 : 240;
  const to = direction === "up" ? 240 : 286;
  const head =
    direction === "up"
      ? `M ${x - 7} ${to + 9} L ${x} ${to} L ${x + 7} ${to + 9} Z`
      : `M ${x - 7} ${to - 9} L ${x} ${to} L ${x + 7} ${to - 9} Z`;

  return (
    <g className="fill-muted-foreground stroke-muted-foreground">
      <text x={x} y={228} textAnchor="middle" fontSize={18} fontWeight={600} stroke="none">
        {sign}
      </text>
      <line x1={x} y1={from} x2={x} y2={to} strokeWidth={3} strokeLinecap="round" />
      <path d={head} strokeWidth={1} strokeLinejoin="round" />
    </g>
  );
}

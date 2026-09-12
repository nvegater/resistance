import { useId } from "react";

import { AMPEL_LABEL, AMPEL_PHASE, type Ampel } from "@/lib/domain/mapping";
import type { AmpelCount } from "@/lib/domain/scoring";
import { fill, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The volcano model drawn from the survey data instead of a fixed illustration.
 *
 * The whole drawing carries one colour: the Ampel of the whole organization, the
 * phase with the most participants. The magma chamber under the ground line is
 * filled in that colour and labelled with how many participants are in that phase.
 * How far the magma has risen in the conduit and what comes out of the crater show
 * the same phase: ROT erupts with a lava fountain, GELB smokes, GRÜN stays quiet.
 * The client asked for exactly this (protocol item 15): the volcano must look like
 * the overall result, not like the distribution. The distribution stays in the
 * donut and the table beside it.
 */

const VIEW_WIDTH = 500;
const VIEW_HEIGHT = 336;

/** The line between the visible level (Zone 2) and the invisible one (Zone 1). */
const GROUND_Y = 170;

const CHAMBER_X = 155;
const CHAMBER_Y = 204;
const CHAMBER_W = 190;
const CHAMBER_H = 86;

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

const PHASE_FILL: Record<Ampel, string> = {
  ROT: "fill-ampel-rot-mark",
  GELB: "fill-ampel-gelb-mark",
  "GRÜN": "fill-ampel-gruen-mark",
};

/** How high the magma stands in the conduit. One value per phase, not a measurement. */
const MAGMA_TOP: Record<Ampel, number> = { ROT: 108, GELB: 150, "GRÜN": 186 };

const CRATER_TEXT: Record<Ampel, string> = {
  ROT: t.volcano.crater.ROT,
  GELB: t.volcano.crater.GELB,
  "GRÜN": t.volcano.crater["GRÜN"],
};

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
  const conduitClipId = `vulkan-schlot-${uid}`;

  const magmaTop = phase ? MAGMA_TOP[phase] : MAGMA_TOP["GRÜN"];
  const phaseCount = phase
    ? (ampelCounts.find((entry) => entry.ampel === phase)?.count ?? 0)
    : 0;

  const chamberText = phase
    ? fill(t.volcano.chamber, {
        ampel: AMPEL_LABEL[phase],
        phase: AMPEL_PHASE[phase].phase,
        count: phaseCount,
        total,
      })
    : t.volcano.chamberEmpty;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className={className}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>
        {phase
          ? fill(t.volcano.srTitle, {
              ampel: AMPEL_LABEL[phase],
              phase: AMPEL_PHASE[phase].phase,
            })
          : t.volcano.srTitleEmpty}
      </title>
      <desc id={descId}>
        {fill(t.volcano.srDescription, {
          chamber: chamberText,
          crater: phase ? CRATER_TEXT[phase] : CRATER_TEXT["GRÜN"],
        })}
      </desc>

      <defs>
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
          className={PHASE_FILL[phase]}
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

      {/* The magma chamber in the colour of the overall phase. Empty until the
          first answer arrives. */}
      <rect
        x={CHAMBER_X}
        y={CHAMBER_Y}
        width={CHAMBER_W}
        height={CHAMBER_H}
        rx={8}
        className={cn(
          "stroke-muted-foreground",
          phase ? PHASE_FILL[phase] : "fill-background",
        )}
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
          {t.volcano.zone2Short}
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
          {t.volcano.zone1Short}
        </text>

        {phase ? (
          <g>
            <line
              x1={CHAMBER_X + CHAMBER_W}
              y1={CHAMBER_Y + CHAMBER_H / 2}
              x2={CHAMBER_X + CHAMBER_W + 12}
              y2={CHAMBER_Y + CHAMBER_H / 2}
              className="stroke-muted-foreground"
              strokeWidth={1}
            />
            <text
              x={CHAMBER_X + CHAMBER_W + 18}
              y={CHAMBER_Y + CHAMBER_H / 2}
              dominantBaseline="middle"
              className="fill-foreground"
              fontSize={16}
              fontWeight={600}
            >
              {phaseCount} · {AMPEL_LABEL[phase]}
            </text>
          </g>
        ) : null}
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

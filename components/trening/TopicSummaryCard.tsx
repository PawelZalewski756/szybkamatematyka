"use client";

import { MathText } from "@/components/trening/MathText";
import type {
  CheatsheetSummary,
  FigureSummary,
  PlotSummary,
  StepsSummary,
  TableSummary,
  TopicSummary,
} from "@/lib/trening/summaries";

const PARABOLA_PATH = (() => {
  const points: string[] = [];
  for (let x = 80; x <= 300; x += 2) {
    const y = 270 - 0.0125 * (x - 190) ** 2;
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
})();

const EXPONENTIAL_PATH = (() => {
  const points: string[] = [];
  for (let x = 70; x <= 300; x += 2) {
    const y = 250 - 7 * (Math.exp((x - 70) / 70) - 1);
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
})();

const CURVE_PATH = (() => {
  const points: string[] = [];
  for (let x = 70; x <= 320; x += 2) {
    const y = 170 - 70 * Math.sin((x - 70) / 50);
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
})();

export function TopicSummaryCard({
  summary,
  id,
}: {
  summary: TopicSummary;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-lg border border-surface-border bg-surface"
    >
      <header className="border-b border-surface-border px-5 py-4 sm:px-6">
        <p className="text-overline text-accent">{summary.eyebrow}</p>
        <h3 className="mt-1 text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
          {summary.title}
        </h3>
        {summary.intro ? (
          <p className="mt-1 text-sm text-muted">{summary.intro}</p>
        ) : null}
      </header>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {summary.variant === "steps" ? (
          <StepsBody summary={summary} />
        ) : null}
        {summary.variant === "figure" ? (
          <FigureBody summary={summary} />
        ) : null}
        {summary.variant === "plot" ? <PlotBody summary={summary} /> : null}
        {summary.variant === "cheatsheet" ? (
          <CheatsheetBody summary={summary} />
        ) : null}
        {summary.variant === "table" ? <TableBody summary={summary} /> : null}

        {summary.footer ? (
          <p className="mt-5 border-t border-surface-border pt-4 text-xs leading-relaxed text-muted">
            <MathText content={summary.footer} />
          </p>
        ) : null}
      </div>
    </section>
  );
}

function StepsBody({ summary }: { summary: StepsSummary }) {
  return (
    <ol>
      {summary.items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className="relative flex gap-4 pb-5 last:pb-0"
        >
          {index < summary.items.length - 1 ? (
            <span
              aria-hidden
              className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-surface-border"
            />
          ) : null}

          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent ring-1 ring-accent/20">
            {index + 1}
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">{item.title}</p>
              {item.note ? (
                <p className="mt-0.5 text-xs text-muted">{item.note}</p>
              ) : null}
            </div>
            {item.formula ? (
              <div className="w-fit shrink-0 rounded-lg bg-surface-hover px-3 py-1.5 text-sm text-foreground">
                <MathText content={item.formula} />
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function FigureBody({ summary }: { summary: FigureSummary }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
      <div className="rounded-lg border border-surface-border bg-background/40 p-3 sm:p-4">
        <FigureSvg kind={summary.figure} />
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-accent-soft px-4 py-3 text-center text-lg text-foreground">
          <MathText content={summary.formula} as="div" />
        </div>

        <ul className="space-y-2">
          {summary.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2 text-sm text-muted">
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              />
              <span className="min-w-0">
                <MathText content={bullet} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PlotBody({ summary }: { summary: PlotSummary }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
      <div className="rounded-lg border border-surface-border bg-background/40 p-3 sm:p-4">
        <PlotSvg kind={summary.plot} />
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-accent-soft px-4 py-3 text-center text-lg text-foreground">
          <MathText content={summary.formula} as="div" />
        </div>

        <ul className="space-y-3">
          {summary.facts.map((fact) => (
            <li key={fact.title}>
              <p className="text-sm font-semibold text-foreground">
                <MathText content={fact.title} />
              </p>
              {fact.note ? (
                <p className="text-xs text-muted">
                  <MathText content={fact.note} />
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CheatsheetBody({ summary }: { summary: CheatsheetSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {summary.items.map((item) => (
        <div
          key={item.title}
          className="rounded-lg border border-surface-border bg-background/40 p-4"
        >
          <p className="text-sm font-bold text-foreground">{item.title}</p>
          {item.formula ? (
            <div className="mt-2 rounded-md bg-surface-hover px-3 py-1.5 text-sm text-foreground">
              <MathText content={item.formula} />
            </div>
          ) : null}
          {item.note ? (
            <p className="mt-2 text-xs text-muted">
              <MathText content={item.note} />
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function TableBody({ summary }: { summary: TableSummary }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {summary.columns.map((column) => (
              <th
                key={column}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summary.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-surface-border last:border-0"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-3 py-2 align-top text-foreground"
                >
                  <MathText content={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FigureSvg({ kind }: { kind: FigureSummary["figure"] }) {
  switch (kind) {
    case "right-triangle":
      return <RightTriangleFigure />;
    case "right-triangle-angle":
      return <RightTriangleAngleFigure />;
    case "circle":
      return <CircleFigure />;
    case "triangle":
      return <TriangleFigure />;
    case "quadrilateral":
      return <QuadrilateralFigure />;
    case "solid":
      return <SolidFigure />;
    case "angle":
      return <AngleFigure />;
    case "symmetry":
      return <SymmetryFigure />;
  }
}

function TriangleFigure() {
  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Trójkąt z podstawą a i wysokością h"
      className="mx-auto h-auto w-full max-w-sm"
    >
      <polygon
        points="50,230 290,230 180,60"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M180 60 L180 230"
        stroke="var(--muted)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <path
        d="M180 214 H196 V230"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
      <text
        x="160"
        y="252"
        fill="var(--accent)"
        fontSize="16"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        a
      </text>
      <text
        x="192"
        y="150"
        fill="var(--muted)"
        fontSize="14"
        fontStyle="italic"
        textAnchor="middle"
      >
        h
      </text>
      <text
        x="105"
        y="135"
        fill="var(--accent)"
        fontSize="15"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        b
      </text>
      <text
        x="240"
        y="135"
        fill="var(--accent)"
        fontSize="15"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        c
      </text>
    </svg>
  );
}

function QuadrilateralFigure() {
  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Prostokąt z bokami a i b"
      className="mx-auto h-auto w-full max-w-sm"
    >
      <rect
        x="60"
        y="80"
        width="220"
        height="140"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
      <text
        x="170"
        y="244"
        fill="var(--accent)"
        fontSize="16"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        a
      </text>
      <text
        x="296"
        y="154"
        fill="var(--accent)"
        fontSize="16"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        b
      </text>
    </svg>
  );
}

function SolidFigure() {
  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Prostopadłościan z krawędziami a, b i c"
      className="mx-auto h-auto w-full max-w-sm"
    >
      <polygon
        points="70,100 110,70 270,70 230,100"
        fill="var(--surface-hover)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      <polygon
        points="230,100 270,70 270,180 230,210"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      <rect
        x="70"
        y="100"
        width="160"
        height="110"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
      <path
        d="M70 210 L110 180 L270 180"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <path
        d="M110 180 L110 70"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <text
        x="150"
        y="232"
        fill="var(--accent)"
        fontSize="15"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        a
      </text>
      <text
        x="244"
        y="160"
        fill="var(--accent)"
        fontSize="15"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        b
      </text>
      <text
        x="182"
        y="84"
        fill="var(--accent)"
        fontSize="15"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        c
      </text>
    </svg>
  );
}

function AngleFigure() {
  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Dwie proste przecinające się pod kątem alfa"
      className="mx-auto h-auto w-full max-w-sm"
    >
      <line
        x1="40"
        y1="150"
        x2="280"
        y2="150"
        stroke="var(--muted)"
        strokeWidth="2"
      />
      <line
        x1="60"
        y1="60"
        x2="260"
        y2="240"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
      <path
        d="M200 150 A40 40 0 0 0 190 123"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.8"
      />
      <text
        x="204"
        y="132"
        fill="var(--accent)"
        fontSize="15"
        fontStyle="italic"
        fontWeight="700"
      >
        α
      </text>
      <circle cx="160" cy="150" r="4" fill="var(--accent)" />
    </svg>
  );
}

function SymmetryFigure() {
  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Figura i jej odbicie względem osi symetrii"
      className="mx-auto h-auto w-full max-w-sm"
    >
      <line
        x1="160"
        y1="40"
        x2="160"
        y2="250"
        stroke="var(--muted)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
      <polygon
        points="55,220 135,80 135,220"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polygon
        points="265,220 185,80 185,220"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <text
        x="95"
        y="240"
        fill="var(--accent)"
        fontSize="14"
        fontWeight="700"
        textAnchor="middle"
      >
        A
      </text>
      <text
        x="225"
        y="240"
        fill="var(--accent)"
        fontSize="14"
        fontWeight="700"
        textAnchor="middle"
      >
        A′
      </text>
    </svg>
  );
}

function RightTriangleFigure() {
  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Trójkąt prostokątny z przyprostokątnymi a i b oraz przeciwprostokątną c"
      className="mx-auto h-auto w-full max-w-sm"
    >
      <polygon
        points="50,240 50,50 280,240"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M50 222 H68 V240"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
      <text
        x="30"
        y="150"
        fill="var(--accent)"
        fontSize="18"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        a
      </text>
      <text
        x="165"
        y="264"
        fill="var(--accent)"
        fontSize="18"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        b
      </text>
      <text
        x="178"
        y="132"
        fill="var(--accent)"
        fontSize="18"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        c
      </text>
    </svg>
  );
}

function RightTriangleAngleFigure() {
  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Trójkąt prostokątny z kątem alfa przy podstawie"
      className="mx-auto h-auto w-full max-w-sm"
    >
      <polygon
        points="50,240 50,50 280,240"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M50 222 H68 V240"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
      <path
        d="M245 240 A35 35 0 0 1 253 217.5"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.8"
      />
      <text
        x="238"
        y="226"
        fill="var(--accent)"
        fontSize="14"
        fontStyle="italic"
        fontWeight="700"
      >
        α
      </text>
      <text
        x="30"
        y="150"
        fill="var(--accent)"
        fontSize="18"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        a
      </text>
      <text
        x="165"
        y="264"
        fill="var(--accent)"
        fontSize="18"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        b
      </text>
      <text
        x="178"
        y="132"
        fill="var(--accent)"
        fontSize="18"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        c
      </text>
    </svg>
  );
}

function CircleFigure() {
  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Okrąg z zaznaczonym promieniem r i średnicą d"
      className="mx-auto h-auto w-full max-w-sm"
    >
      <circle
        cx="160"
        cy="140"
        r="90"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
      <line
        x1="70"
        y1="140"
        x2="250"
        y2="140"
        stroke="var(--muted)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <line
        x1="160"
        y1="140"
        x2="250"
        y2="140"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      <circle cx="160" cy="140" r="4" fill="var(--accent)" />
      <text
        x="205"
        y="130"
        fill="var(--accent)"
        fontSize="17"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
      >
        r
      </text>
      <text
        x="105"
        y="160"
        fill="var(--muted)"
        fontSize="13"
        fontStyle="italic"
        textAnchor="middle"
      >
        d
      </text>
      <text
        x="160"
        y="164"
        fill="var(--muted)"
        fontSize="12"
        textAnchor="middle"
      >
        O
      </text>
    </svg>
  );
}

function PlotSvg({ kind }: { kind: PlotSummary["plot"] }) {
  switch (kind) {
    case "parabola":
      return <ParabolaPlot />;
    case "line":
      return <LinePlot />;
    case "exponential":
      return <ExponentialPlot />;
    case "points":
      return <PointsPlot />;
    case "curve":
      return <CurvePlot />;
  }
}

function PlotAxes({ xAxisY = 250 }: { xAxisY?: number }) {
  return (
    <>
      <g stroke="var(--surface-border)" strokeOpacity="0.55" strokeWidth="1">
        {[110, 150, 230, 270, 310].map((x) => (
          <line key={`gx${x}`} x1={x} y1="30" x2={x} y2="290" />
        ))}
        {[90, 130, 170, 210].map((y) => (
          <line key={`gy${y}`} x1="40" y1={y} x2="330" y2={y} />
        ))}
      </g>
      <line
        x1="30"
        y1={xAxisY}
        x2="338"
        y2={xAxisY}
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
      <line
        x1="70"
        y1="292"
        x2="70"
        y2="28"
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
      <polygon
        points={`338,${xAxisY} 330,${xAxisY - 4} 330,${xAxisY + 4}`}
        fill="var(--muted)"
      />
      <polygon points="70,28 66,36 74,36" fill="var(--muted)" />
      <text x="330" y={xAxisY + 18} fill="var(--muted)" fontSize="11">
        x
      </text>
      <text x="80" y="40" fill="var(--muted)" fontSize="11">
        y
      </text>
    </>
  );
}

function LinePlot() {
  return (
    <svg
      viewBox="0 0 360 320"
      role="img"
      aria-label="Wykres funkcji liniowej y równa się a x plus b"
      className="mx-auto h-auto w-full max-w-md"
    >
      <PlotAxes xAxisY={250} />
      <line
        x1="80"
        y1="270"
        x2="320"
        y2="80"
        stroke="var(--accent)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <text
        x="222"
        y="66"
        fill="var(--accent)"
        fontSize="12"
        fontWeight="600"
      >
        y = ax + b
      </text>
    </svg>
  );
}

function ExponentialPlot() {
  return (
    <svg
      viewBox="0 0 360 320"
      role="img"
      aria-label="Wykres funkcji wykładniczej y równa się a do potęgi x"
      className="mx-auto h-auto w-full max-w-md"
    >
      <PlotAxes xAxisY={250} />
      <line
        x1="70"
        y1="250"
        x2="330"
        y2="250"
        stroke="var(--surface-border)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <path
        d={EXPONENTIAL_PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <text
        x="238"
        y="78"
        fill="var(--accent)"
        fontSize="12"
        fontWeight="600"
      >
        y = a^x
      </text>
      <text x="238" y="96" fill="var(--muted)" fontSize="11">
        a &gt; 1
      </text>
    </svg>
  );
}

function PointsPlot() {
  return (
    <svg
      viewBox="0 0 360 320"
      role="img"
      aria-label="Punkty A i B w układzie współrzędnych"
      className="mx-auto h-auto w-full max-w-md"
    >
      <PlotAxes xAxisY={250} />
      <line
        x1="120"
        y1="200"
        x2="260"
        y2="110"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
      <line
        x1="120"
        y1="200"
        x2="120"
        y2="250"
        stroke="var(--muted)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <line
        x1="120"
        y1="200"
        x2="70"
        y2="200"
        stroke="var(--muted)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <line
        x1="260"
        y1="110"
        x2="260"
        y2="250"
        stroke="var(--muted)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <line
        x1="260"
        y1="110"
        x2="70"
        y2="110"
        stroke="var(--muted)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <circle cx="120" cy="200" r="5" fill="var(--accent)" />
      <circle cx="260" cy="110" r="5" fill="var(--accent)" />
      <text
        x="108"
        y="190"
        fill="var(--accent)"
        fontSize="13"
        fontWeight="700"
        textAnchor="end"
      >
        A
      </text>
      <text
        x="272"
        y="102"
        fill="var(--accent)"
        fontSize="13"
        fontWeight="700"
      >
        B
      </text>
    </svg>
  );
}

function CurvePlot() {
  return (
    <svg
      viewBox="0 0 360 320"
      role="img"
      aria-label="Przykładowy wykres funkcji z maksimum i minimum"
      className="mx-auto h-auto w-full max-w-md"
    >
      <PlotAxes xAxisY={250} />
      <path
        d={CURVE_PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="148" cy="100" r="4.5" fill="var(--accent)" />
      <circle cx="305" cy="240" r="4.5" fill="var(--accent)" />
      <text x="156" y="94" fill="var(--accent)" fontSize="11" fontWeight="600">
        max
      </text>
      <text x="282" y="232" fill="var(--accent)" fontSize="11" fontWeight="600">
        min
      </text>
      <text x="262" y="68" fill="var(--muted)" fontSize="11">
        y = f(x)
      </text>
    </svg>
  );
}

function ParabolaPlot() {
  return (
    <svg
      viewBox="0 0 360 320"
      role="img"
      aria-label="Parabola z wierzchołkiem W i miejscami zerowymi x1 oraz x2"
      className="mx-auto h-auto w-full max-w-md"
    >
      <g stroke="var(--surface-border)" strokeOpacity="0.55" strokeWidth="1">
        {[110, 150, 230, 270, 310].map((x) => (
          <line key={`v${x}`} x1={x} y1="30" x2={x} y2="290" />
        ))}
        {[80, 120, 160, 200].map((y) => (
          <line key={`h${y}`} x1="40" y1={y} x2="330" y2={y} />
        ))}
      </g>

      <line
        x1="30"
        y1="240"
        x2="338"
        y2="240"
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
      <line
        x1="70"
        y1="292"
        x2="70"
        y2="28"
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
      <polygon points="338,240 330,236 330,244" fill="var(--muted)" />
      <polygon points="70,28 66,36 74,36" fill="var(--muted)" />

      <line
        x1="190"
        y1="60"
        x2="190"
        y2="290"
        stroke="var(--surface-border)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />

      <path
        d={PARABOLA_PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <circle
        cx="141"
        cy="240"
        r="4.5"
        fill="var(--accent)"
        stroke="var(--surface)"
        strokeWidth="2"
      />
      <circle
        cx="239"
        cy="240"
        r="4.5"
        fill="var(--accent)"
        stroke="var(--surface)"
        strokeWidth="2"
      />
      <circle
        cx="190"
        cy="270"
        r="5"
        fill="var(--accent)"
        stroke="var(--surface)"
        strokeWidth="2"
      />

      <text
        x="141"
        y="258"
        fill="var(--muted)"
        fontSize="11"
        fontWeight="600"
        textAnchor="middle"
      >
        x₁
      </text>
      <text
        x="239"
        y="258"
        fill="var(--muted)"
        fontSize="11"
        fontWeight="600"
        textAnchor="middle"
      >
        x₂
      </text>
      <text
        x="198"
        y="288"
        fill="var(--accent)"
        fontSize="10.5"
        fontWeight="600"
      >
        W(p, q)
      </text>
      <text x="330" y="258" fill="var(--muted)" fontSize="11">
        x
      </text>
      <text x="80" y="40" fill="var(--muted)" fontSize="11">
        y
      </text>
    </svg>
  );
}

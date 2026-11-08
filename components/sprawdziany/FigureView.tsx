import type { Figure } from "@/lib/sprawdziany/types";

type Pt = [number, number];

const STROKE = "currentColor";

function Label({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  if (!children) return null;
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={13} fontWeight={600} fill="currentColor">
      {children}
    </text>
  );
}

function Poly({ pts, dashed }: { pts: Pt[]; dashed?: boolean }) {
  return (
    <polyline
      points={pts.map((p) => p.join(",")).join(" ")}
      fill="none"
      stroke={STROKE}
      strokeWidth={2}
      strokeDasharray={dashed ? "5 4" : undefined}
      strokeLinejoin="round"
    />
  );
}

function Line({ a, b, dashed }: { a: Pt; b: Pt; dashed?: boolean }) {
  return <Poly pts={[a, b]} dashed={dashed} />;
}

function RightMark({ v, d1, d2, size = 11 }: { v: Pt; d1: Pt; d2: Pt; size?: number }) {
  const p1: Pt = [v[0] + d1[0] * size, v[1] + d1[1] * size];
  const p2: Pt = [v[0] + d2[0] * size, v[1] + d2[1] * size];
  const p3: Pt = [p1[0] + d2[0] * size, p1[1] + d2[1] * size];
  return <Poly pts={[p1, p3, p2]} />;
}

function Vertex({ p, name, dx, dy }: { p: Pt; name: string; dx: number; dy: number }) {
  return (
    <text
      x={p[0] + dx}
      y={p[1] + dy}
      textAnchor="middle"
      fontSize={13}
      fontStyle="italic"
      fill="currentColor"
      opacity={0.8}
    >
      {name}
    </text>
  );
}

function Wrapper({
  children,
  width = 260,
  height = 175,
  label,
}: {
  children: React.ReactNode;
  width?: number;
  height?: number;
  label: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="mx-auto h-auto w-full max-w-[300px] text-foreground"
    >
      {children}
    </svg>
  );
}

type Of<K extends Figure["kind"]> = Extract<Figure, { kind: K }>;

function RightTriangle({ f }: { f: Of<"right-triangle"> }) {
  const num = (s: string) => {
    const m = s.replace(",", ".").match(/^\s*(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : null;
  };
  let a = num(f.a);
  let b = num(f.b);
  const c = num(f.c);
  if (a === null && b !== null && c !== null && c > b) a = Math.sqrt(c * c - b * b);
  if (b === null && a !== null && c !== null && c > a) b = Math.sqrt(c * c - a * a);
  if (a === null && b === null && c === null) {
    a = 4;
    b = 3;
  }
  if (a === null || b === null) {
    a = a ?? 4;
    b = b ?? 3;
  }
  const scale = Math.min(190 / a, 110 / b);
  const w = a * scale;
  const h = b * scale;
  const A: Pt = [(260 - w) / 2 + 10, 145];
  const B: Pt = [A[0] + w, 145];
  const C: Pt = [A[0], 145 - h];
  return (
    <Wrapper label="Trójkąt prostokątny">
      <Poly pts={[A, B, C, A]} />
      <RightMark v={A} d1={[1, 0]} d2={[0, -1]} />
      <Label x={(A[0] + B[0]) / 2} y={165}>{f.a}</Label>
      <Label x={A[0] - 8} y={(A[1] + C[1]) / 2 + 4} anchor="end">{f.b}</Label>
      <Label x={(B[0] + C[0]) / 2 + 8} y={(B[1] + C[1]) / 2 - 6} anchor="start">{f.c}</Label>
    </Wrapper>
  );
}

function Triangle({ f }: { f: Of<"triangle"> }) {
  const A: Pt = [30, 140];
  const B: Pt = [190, 140];
  const C: Pt = [105, 28];
  return (
    <Wrapper label="Trójkąt z oznaczonymi kątami">
      <Poly pts={[A, B, C, A]} />
      {f.exterior && <Line a={B} b={[245, 140]} />}
      <Label x={A[0] + 34} y={A[1] - 8}>{f.angles[0]}</Label>
      <Label x={B[0] - 36} y={B[1] - 8}>{f.angles[1]}</Label>
      <Label x={C[0]} y={C[1] + 34}>{f.angles[2]}</Label>
      {f.exterior && <Label x={B[0] + 36} y={B[1] - 12}>{f.exterior}</Label>}
      <Vertex p={A} name="A" dx={-10} dy={14} />
      <Vertex p={B} name="B" dx={0} dy={18} />
      <Vertex p={C} name="C" dx={0} dy={-8} />
    </Wrapper>
  );
}

function Isosceles({ f }: { f: Of<"isosceles"> }) {
  const A: Pt = [30, 140];
  const B: Pt = [210, 140];
  const C: Pt = [120, 28];
  const H: Pt = [120, 140];
  return (
    <Wrapper label="Trójkąt równoramienny">
      <Poly pts={[A, B, C, A]} />
      {f.height && (
        <>
          <Line a={C} b={H} dashed />
          <RightMark v={H} d1={[-1, 0]} d2={[0, -1]} size={9} />
          <Label x={128} y={92} anchor="start">{f.height}</Label>
        </>
      )}
      <Label x={120} y={162}>{f.base}</Label>
      <Label x={64} y={78} anchor="end">{f.arm}</Label>
      {f.apexAngle && <Label x={120} y={62}>{f.apexAngle}</Label>}
      {f.baseAngle && <Label x={A[0] + 36} y={A[1] - 7}>{f.baseAngle}</Label>}
    </Wrapper>
  );
}

function TriangleHeight({ f }: { f: Of<"triangle-height"> }) {
  const A: Pt = [25, 140];
  const B: Pt = [225, 140];
  const C: Pt = [85, 30];
  const H: Pt = [85, 140];
  return (
    <Wrapper label="Trójkąt z wysokością">
      <Poly pts={[A, B, C, A]} />
      <Line a={C} b={H} dashed />
      <RightMark v={H} d1={[-1, 0]} d2={[0, -1]} size={9} />
      <Label x={93} y={92} anchor="start">{f.height}</Label>
      <Label x={125} y={162}>{f.base}</Label>
    </Wrapper>
  );
}

function RectangleFig({ f }: { f: Of<"rectangle"> }) {
  const sq = f.w === f.h;
  const w = sq ? 110 : 170;
  const h = 110;
  const x0 = (260 - w) / 2;
  const y0 = 28;
  return (
    <Wrapper label={sq ? "Kwadrat" : "Prostokąt"}>
      <Poly
        pts={[
          [x0, y0],
          [x0 + w, y0],
          [x0 + w, y0 + h],
          [x0, y0 + h],
          [x0, y0],
        ]}
      />
      {f.diagonal && (
        <>
          <Line a={[x0, y0 + h]} b={[x0 + w, y0]} dashed />
          <Label x={x0 + w / 2 + 6} y={y0 + h / 2 - 8} anchor="start">{f.diagonal}</Label>
        </>
      )}
      <Label x={x0 + w / 2} y={y0 + h + 20}>{f.w}</Label>
      <Label x={x0 - 8} y={y0 + h / 2 + 4} anchor="end">{f.h}</Label>
    </Wrapper>
  );
}

function ParallelogramFig({ f }: { f: Of<"parallelogram"> }) {
  const A: Pt = [20, 140];
  const B: Pt = [170, 140];
  const C: Pt = [240, 40];
  const D: Pt = [90, 40];
  const H: Pt = [90, 140];
  return (
    <Wrapper label="Równoległobok">
      <Poly pts={[A, B, C, D, A]} />
      {f.height && (
        <>
          <Line a={D} b={H} dashed />
          <RightMark v={H} d1={[-1, 0]} d2={[0, -1]} size={9} />
          <Label x={98} y={96} anchor="start">{f.height}</Label>
        </>
      )}
      {f.base && <Label x={95} y={162}>{f.base}</Label>}
      {f.side && <Label x={214} y={100} anchor="start">{f.side}</Label>}
      {f.angle && <Label x={A[0] + 36} y={A[1] - 8}>{f.angle}</Label>}
      <Vertex p={A} name="A" dx={-10} dy={14} />
      <Vertex p={B} name="B" dx={4} dy={16} />
      <Vertex p={C} name="C" dx={8} dy={-6} />
      <Vertex p={D} name="D" dx={-8} dy={-6} />
    </Wrapper>
  );
}

function TrapezoidFig({ f }: { f: Of<"trapezoid"> }) {
  const A: Pt = [20, 140];
  const B: Pt = [235, 140];
  const C: Pt = [185, 40];
  const D: Pt = [70, 40];
  const H: Pt = [70, 140];
  return (
    <Wrapper label="Trapez">
      <Poly pts={[A, B, C, D, A]} />
      <Line a={D} b={H} dashed />
      <RightMark v={H} d1={[-1, 0]} d2={[0, -1]} size={9} />
      <Label x={78} y={96} anchor="start">{f.height}</Label>
      <Label x={127} y={30}>{f.top}</Label>
      <Label x={127} y={162}>{f.bottom}</Label>
    </Wrapper>
  );
}

function RhombusFig({ f }: { f: Of<"rhombus"> }) {
  const T: Pt = [130, 18];
  const R: Pt = [225, 85];
  const Bt: Pt = [130, 152];
  const L: Pt = [35, 85];
  return (
    <Wrapper label="Romb z przekątnymi">
      <Poly pts={[T, R, Bt, L, T]} />
      <Line a={T} b={Bt} dashed />
      <Line a={L} b={R} dashed />
      <Label x={136} y={60} anchor="start">{f.d1}</Label>
      <Label x={176} y={102}>{f.d2}</Label>
      {f.side && <Label x={192} y={46} anchor="start">{f.side}</Label>}
    </Wrapper>
  );
}

function BoxFig({ f }: { f: Of<"box"> }) {
  const fl: Pt = [20, 150];
  const fr: Pt = [140, 150];
  const ftr: Pt = [140, 75];
  const ftl: Pt = [20, 75];
  const o: Pt = [70, -45];
  const sh = (p: Pt): Pt => [p[0] + o[0], p[1] + o[1]];
  const bl = sh(fl);
  const br = sh(fr);
  const btr = sh(ftr);
  const btl = sh(ftl);
  return (
    <Wrapper label="Prostopadłościan">
      <Poly pts={[fl, fr, ftr, ftl, fl]} />
      <Poly pts={[ftl, btl, btr, ftr]} />
      <Line a={fr} b={br} />
      <Line a={br} b={btr} />
      <Line a={fl} b={bl} dashed />
      <Line a={bl} b={br} dashed />
      <Line a={bl} b={btl} dashed />
      {f.diagonal && (
        <>
          <Line a={fl} b={btr} dashed />
          <Label x={96} y={98} anchor="end">{f.diagonal}</Label>
        </>
      )}
      <Label x={80} y={170}>{f.a}</Label>
      <Label x={12} y={116} anchor="end">{f.c}</Label>
      <Label x={186} y={142} anchor="start">{f.b}</Label>
    </Wrapper>
  );
}

function PyramidFig({ f }: { f: Of<"pyramid"> }) {
  const A: Pt = [30, 140];
  const B: Pt = [160, 140];
  const C: Pt = [230, 105];
  const D: Pt = [100, 105];
  const S: Pt = [130, 22];
  const O: Pt = [130, 122];
  const M: Pt = [95, 140];
  return (
    <Wrapper label="Ostrosłup prawidłowy czworokątny">
      <Poly pts={[A, B, C]} />
      <Poly pts={[A, D, C]} dashed />
      <Line a={S} b={A} />
      <Line a={S} b={B} />
      <Line a={S} b={C} />
      <Line a={S} b={D} dashed />
      {f.height && (
        <>
          <Line a={S} b={O} dashed />
          <Label x={136} y={74} anchor="start">{f.height}</Label>
        </>
      )}
      {f.wall && (
        <>
          <Line a={S} b={M} dashed />
          <Label x={72} y={92} anchor="end">{f.wall}</Label>
        </>
      )}
      <Label x={95} y={162}>{f.base}</Label>
      {f.edge && <Label x={176} y={86} anchor="start">{f.edge}</Label>}
    </Wrapper>
  );
}

function CoordinateFig({ f }: { f: Of<"coordinate"> }) {
  const xs = f.points.map((p) => p.x);
  const ys = f.points.map((p) => p.y);
  const xMin = Math.min(0, ...xs) - 1;
  const xMax = Math.max(0, ...xs) + 1;
  const yMin = Math.min(0, ...ys) - 1;
  const yMax = Math.max(0, ...ys) + 1;
  const W = 260;
  const H = 200;
  const pad = 14;
  const unit = Math.min((W - 2 * pad) / (xMax - xMin), (H - 2 * pad) / (yMax - yMin));
  const ox = (W - unit * (xMax - xMin)) / 2;
  const oy = (H - unit * (yMax - yMin)) / 2;
  const sx = (x: number) => ox + (x - xMin) * unit;
  const sy = (y: number) => H - oy - (y - yMin) * unit;
  const xTicks = Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i);
  const yTicks = Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i);
  const pts: Pt[] = f.points.map((p) => [sx(p.x), sy(p.y)]);
  return (
    <Wrapper width={W} height={H} label="Układ współrzędnych">
      {xTicks.map((x) => (
        <line key={`vx${x}`} x1={sx(x)} y1={sy(yMin)} x2={sx(x)} y2={sy(yMax)} stroke={STROKE} strokeOpacity={0.15} />
      ))}
      {yTicks.map((y) => (
        <line key={`hy${y}`} x1={sx(xMin)} y1={sy(y)} x2={sx(xMax)} y2={sy(y)} stroke={STROKE} strokeOpacity={0.15} />
      ))}
      <Line a={[sx(xMin), sy(0)]} b={[sx(xMax), sy(0)]} />
      <Line a={[sx(0), sy(yMin)]} b={[sx(0), sy(yMax)]} />
      {xTicks.filter((x) => x !== 0).map((x) => (
        <text key={`tx${x}`} x={sx(x)} y={sy(0) + 13} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>{x}</text>
      ))}
      {yTicks.filter((y) => y !== 0).map((y) => (
        <text key={`ty${y}`} x={sx(0) - 5} y={sy(y) + 3} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.7}>{y}</text>
      ))}
      <Label x={sx(xMax) - 4} y={sy(0) - 6} anchor="end">x</Label>
      <Label x={sx(0) + 8} y={sy(yMax) + 10} anchor="start">y</Label>
      {f.connect && <Poly pts={pts} />}
      {f.points.map((p, i) => (
        <g key={i}>
          <circle cx={pts[i][0]} cy={pts[i][1]} r={4} fill="currentColor" />
          <Label x={pts[i][0] + 8} y={pts[i][1] - 8} anchor="start">{p.label}</Label>
        </g>
      ))}
    </Wrapper>
  );
}

export function FigureView({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case "right-triangle":
      return <RightTriangle f={figure} />;
    case "triangle":
      return <Triangle f={figure} />;
    case "isosceles":
      return <Isosceles f={figure} />;
    case "triangle-height":
      return <TriangleHeight f={figure} />;
    case "rectangle":
      return <RectangleFig f={figure} />;
    case "parallelogram":
      return <ParallelogramFig f={figure} />;
    case "trapezoid":
      return <TrapezoidFig f={figure} />;
    case "rhombus":
      return <RhombusFig f={figure} />;
    case "box":
      return <BoxFig f={figure} />;
    case "pyramid":
      return <PyramidFig f={figure} />;
    case "coordinate":
      return <CoordinateFig f={figure} />;
  }
}

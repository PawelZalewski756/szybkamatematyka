/* eslint-disable @typescript-eslint/no-explicit-any -- pdfjs-dist nie eksportuje typów stron */
/**
 * Import arkuszy egzaminu ósmoklasisty (CKE) do cache + obrazków.
 *
 *   npm run seed:cke-e8                 # etap 1: PDF -> obrazki zadań + cache (bez klucza)
 *   npm run seed:cke-e8 -- --gemini     # etap 2: rozwiązania z Gemini (GEMINI_API_KEY)
 *   npm run seed:cke-e8 -- --sync       # etap 3: zapis do Supabase (.env.local)
 *
 * Potem: npm run seed:exam-archive
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createCanvas, type Canvas } from "@napi-rs/canvas";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import {
  CKE_E8_SESSIONS,
  type CkeE8Session,
} from "../lib/baza-zadan/cke/e8-sessions";
import { CKE_MATURA_R_SESSIONS } from "../lib/baza-zadan/cke/matura-rozszerzona-sessions";
import { CKE_MATURA_P_SESSIONS } from "../lib/baza-zadan/cke/matura-podstawowa-cke-sessions";
import { isSolutionPlaceholder } from "../lib/baza-zadan/solution-content";
import { DZIALY_MATEMATYKI } from "../lib/baza-zadan/dzialy";
import { inferDzialMatura } from "../lib/baza-zadan/cke/parse-matura-page";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CACHE_DIR = path.resolve(process.cwd(), "data/cke-e8-cache");
const IMG_DIR = path.resolve(process.cwd(), "public/cke-matura");
const PDF_DIR = path.resolve(process.cwd(), ".tmp-cke-e8");
const SCALE = 2;
const PLACEHOLDER = "Rozwiązanie zostanie uzupełnione";

type CachedTask = {
  numer: number;
  dzial?: string;
  tresc: string;
  tekst?: string;
  tekstV?: number;
  figOk?: boolean;
  rozwiazanie: string;
  punkty?: number;
  schemat?: string;
};

type CachedSheet = {
  sessionId: string;
  nazwa: string;
  typ: "egzamin-8" | "matura";
  rok: number;
  miesiac: number;
  tasks: CachedTask[];
  fetchedAt: string;
};

type Line = { text: string; yTop: number; yBottom: number };

type PageData = {
  page: any;
  viewport: any;
  height: number;
  lines: Line[];
};

async function download(url: string, dest: string): Promise<void> {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} dla ${url}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function loadPages(file: string): Promise<PageData[]> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(file));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages: PageData[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: SCALE });
    const tc = await page.getTextContent();
    const lines: Line[] = [];
    let cur: Line | null = null;
    let lastY: number | null = null;
    for (const it of tc.items as any[]) {
      if (typeof it.str !== "string") continue;
      const [, vy] = viewport.convertToViewportPoint(
        it.transform[4],
        it.transform[5],
      );
      const h = (it.height || 10) * SCALE;
      if (lastY === null || Math.abs(vy - lastY) > 3 * SCALE) {
        if (cur) lines.push(cur);
        cur = { text: "", yTop: vy - h, yBottom: vy };
      }
      cur!.text += it.str;
      cur!.yTop = Math.min(cur!.yTop, vy - h);
      cur!.yBottom = Math.max(cur!.yBottom, vy);
      lastY = vy;
    }
    if (cur) lines.push(cur);
    pages.push({ page, viewport, height: viewport.height, lines });
  }
  return pages;
}

type Marker = { numer: number; page: number; y: number; points: number };
type Stop = { page: number; y: number };

function findMarkers(pages: PageData[]): { markers: Marker[]; stops: Stop[] } {
  const markers: Marker[] = [];
  const stops: Stop[] = [];
  pages.forEach((pd, pi) => {
    for (const l of pd.lines) {
      const t = l.text.trim();
      const m = /^Zadanie\s+(\d+)\.?\s*(?:\((?:(\d+)\s*[–-]\s*(\d+)|(\d+)\s*pkt)\))?/.exec(t);
      if (m) {
        markers.push({
          numer: Number(m[1]),
          page: pi,
          y: l.yTop - 4 * SCALE,
          points: m[3] ? Number(m[3]) : m[4] ? Number(m[4]) : 1,
        });
      } else if (
        /^Brudnopis/i.test(t) ||
        /ZNAJDUJE SIĘ NA KARCIE/i.test(t) ||
        /^BRUDNOPIS/.test(t)
      ) {
        stops.push({ page: pi, y: l.yTop - 4 * SCALE });
      }
    }
  });
  return { markers, stops };
}

async function renderPage(pd: PageData): Promise<Canvas> {
  const canvas = createCanvas(
    Math.ceil(pd.viewport.width),
    Math.ceil(pd.viewport.height),
  );
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await pd.page.render({ canvasContext: ctx as any, viewport: pd.viewport })
    .promise;
  return canvas;
}

function trimWhite(canvas: Canvas): Canvas {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const img = ctx.getImageData(0, 0, width, height).data;
  const rowDark = (y: number) => {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      if (img[i] < 200 || img[i + 1] < 200 || img[i + 2] < 200) return true;
    }
    return false;
  };
  let top = 0;
  let bottom = height - 1;
  while (top < bottom && !rowDark(top)) top++;
  while (bottom > top && !rowDark(bottom)) bottom--;
  const pad = 10;
  const t = Math.max(0, top - pad);
  const b = Math.min(height - 1, bottom + pad);
  const out = createCanvas(width, b - t + 1);
  out.getContext("2d").drawImage(canvas, 0, t, width, b - t + 1, 0, 0, width, b - t + 1);
  return out;
}

function sliceCanvas(src: Canvas, y0: number, y1: number): Canvas | null {
  const h = Math.round(y1 - y0);
  if (h < 20) return null;
  const out = createCanvas(src.width, h);
  out.getContext("2d").drawImage(src, 0, Math.round(y0), src.width, h, 0, 0, src.width, h);
  return out;
}

/** Statement of an open task sits above the framed answer grid; the figure sits inside the frame. */
function cutAboveAnswerGrid(
  canvas: Canvas,
  from: number,
  limit: number,
): number | null {
  const { width } = canvas;
  const y0 = Math.max(0, Math.round(from));
  const y1 = Math.min(canvas.height, Math.round(limit));
  if (y1 - y0 < 4) return null;
  const data = canvas
    .getContext("2d")
    .getImageData(0, y0, width, y1 - y0).data;
  const coverage = (y: number, test: (r: number, g: number, b: number) => boolean) => {
    let n = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (test(data[i], data[i + 1], data[i + 2])) n++;
    }
    return n / width;
  };
  let frame = -1;
  for (let y = 0; y < y1 - y0; y++) {
    if (coverage(y, (r, g, b) => r < 100 && g < 100 && b < 100) > 0.6) {
      frame = y;
      break;
    }
  }
  if (frame >= 0) {
    for (let y = frame + 4; y < y1 - y0; y++) {
      if (coverage(y, (r, g, b) => r > 200 && g < 170 && b < 170) > 0.55) {
        return y0 + y - 3;
      }
    }
    return null;
  }
  // Siatka karty rozwiązań w arkuszach od 2023 jest szara.
  for (let y = 0; y < y1 - y0; y++) {
    if (
      coverage(
        y,
        (r, g, b) => r > 150 && r < 225 && Math.abs(r - g) < 8 && Math.abs(r - b) < 8,
      ) > 0.55
    ) {
      return y0 + y - 3;
    }
  }
  return null;
}

async function cropTasks(
  session: CkeE8Session,
  pages: PageData[],
  accept: (numer: number) => boolean = () => true,
  cardMode = false,
): Promise<Map<number, string[]>> {
  const { markers, stops } = findMarkers(pages);
  const seen = new Set<number>();
  const uniq = markers.filter((m) => !seen.has(m.numer) && seen.add(m.numer));
  const wanted = new Set(uniq.filter((m) => accept(m.numer)).map((m) => m.numer));
  const rendered = new Map<number, Canvas>();
  const get = async (p: number) => {
    if (!rendered.has(p)) rendered.set(p, await renderPage(pages[p]));
    return rendered.get(p)!;
  };
  const topMargin = 60 * SCALE;
  const botMargin = 40 * SCALE;
  const outDir = path.join(IMG_DIR, session.id);
  fs.mkdirSync(outDir, { recursive: true });
  const result = new Map<number, string[]>();

  for (let i = 0; i < uniq.length; i++) {
    const cur = uniq[i];
    const next = uniq[i + 1];
    if (!wanted.has(cur.numer)) continue;
    const stopAfter = (page: number, from: number, to: number) =>
      stops
        .filter((s) => s.page === page && s.y > from && s.y < to)
        .sort((a, b) => a.y - b.y)[0];
    const parts: Canvas[] = [];
    const lastPage = next ? next.page : pages.length - 1;
    for (let p = cur.page; p <= lastPage; p++) {
      const h = pages[p].height;
      const start = p === cur.page ? cur.y : topMargin;
      let end = p === lastPage && next ? next.y : h - botMargin;
      const stop = stopAfter(p, start, end);
      const stopped = stop !== undefined;
      const pageCanvas = await get(p);
      if (stop) end = stop.y;
      let cardCut = false;
      if (cardMode && !stop) {
        const cut = cutAboveAnswerGrid(pageCanvas, start, end);
        if (cut !== null) {
          end = cut;
          cardCut = true;
        }
      }
      const sl = sliceCanvas(pageCanvas, start, end);
      if (sl) parts.push(sl);
      if (stopped || cardCut) break;
    }
    if (parts.length === 0) continue;
    const files: string[] = [];
    for (let k = 0; k < parts.length; k++) {
      const trimmed = trimWhite(parts[k]);
      if (trimmed.height < 40 && k > 0) continue;
      const name = `z${String(cur.numer).padStart(2, "0")}-${k + 1}.png`;
      fs.writeFileSync(path.join(outDir, name), trimmed.toBuffer("image/png"));
      files.push(`/cke-matura/${session.id}/${name}`);
    }
    result.set(cur.numer, files);
  }
  return result;
}

function schemeBlocks(pages: PageData[]): Map<number, string> {
  const out = new Map<number, string>();
  let current: number | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current !== null && !out.has(current)) {
      out.set(current, buf.join("\n").trim());
    }
  };
  for (const pd of pages) {
    for (const l of pd.lines) {
      const t = l.text.trim();
      const m = /^Zadanie\s+(\d+)\./.exec(t);
      if (m) {
        flush();
        current = Number(m[1]);
        buf = [];
        continue;
      }
      if (/^Strona \d+ z \d+/.test(t) || /^Zasady oceniania rozwiązań/.test(t)) {
        continue;
      }
      buf.push(t);
    }
  }
  flush();
  return out;
}

function isStub(files: string[]): boolean {
  const abs = path.join(process.cwd(), "public", files[0]);
  return files.length === 1 && fs.existsSync(abs) && fs.statSync(abs).size < 9000;
}

async function importSession(session: CkeE8Session): Promise<void> {
  console.log(`\n== ${session.nazwa}`);
  const arkuszPdf = path.join(PDF_DIR, `${session.id}-arkusz.pdf`);
  const zasadyPdf = path.join(PDF_DIR, `${session.id}-zasady.pdf`);
  await download(session.arkuszUrl, arkuszPdf);
  await download(session.zasadyUrl, zasadyPdf);

  const arkuszPages = await loadPages(arkuszPdf);
  const zasadyPages = await loadPages(zasadyPdf);
  const images = await cropTasks(session, arkuszPages, undefined, session.typ === "matura" && session.rok >= 2023);
  if (session.kartaUrl) {
    const kartaPdf = path.join(PDF_DIR, `${session.id}-karta.pdf`);
    await download(session.kartaUrl, kartaPdf);
    const stubs = new Set(
      [...images.entries()]
        .filter(([, files]) => isStub(files))
        .map(([n]) => n),
    );
    const extra = await cropTasks(session, await loadPages(kartaPdf), (n) => stubs.has(n), true);
    for (const [n, files] of extra) images.set(n, files);
  }
  const schemes = schemeBlocks(zasadyPages);
  const points = new Map(
    findMarkers(arkuszPages).markers.map((m) => [m.numer, m.points]),
  );

  const file = path.join(CACHE_DIR, `${session.id}.json`);
  const prev: CachedSheet | null = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, "utf8"))
    : null;
  const prevByNum = new Map(prev?.tasks.map((t) => [t.numer, t]) ?? []);

  const tasks: CachedTask[] = [...images.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([numer, files]) => ({
      numer,
      punkty: points.get(numer),
      tresc: files.map((f) => `![Zadanie ${numer}](${f})`).join("\n\n"),
      schemat: schemes.get(numer) ?? "",
      rozwiazanie: prevByNum.get(numer)?.rozwiazanie ?? PLACEHOLDER,
    }));

  const sheet: CachedSheet = {
    sessionId: session.id,
    nazwa: session.nazwa,
    typ: session.typ ?? "egzamin-8",
    rok: session.rok,
    miesiac: session.miesiac,
    tasks,
    fetchedAt: new Date().toISOString(),
  };
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(sheet, null, 2), "utf8");
  console.log(`   zadań: ${tasks.length}, schematów: ${schemes.size}`);
}

function loadSheets(): CachedSheet[] {
  if (!fs.existsSync(CACHE_DIR)) return [];
  return fs
    .readdirSync(CACHE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(CACHE_DIR, f), "utf8")));
}

async function fillSolutions(delayMs: number): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Brak GEMINI_API_KEY w .env.local");
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    systemInstruction:
      "Jesteś nauczycielem matematyki. Na podstawie obrazu zadania z egzaminu ósmoklasisty oraz oficjalnego schematu oceniania napisz zwięzłe rozwiązanie po polsku, krok po kroku, wzory w LaTeX ($...$). Pierwszy krok na początku linii: '1. ...'. Zakończ linią 'Odpowiedź: ...' (przy zadaniu zamkniętym podaj literę i treść). Bez emotek i bez długich myślników.",
  });

  for (const sheet of loadSheets()) {
    let changed = false;
    for (const t of sheet.tasks) {
      if (!isSolutionPlaceholder(t.rozwiazanie)) continue;
      const parts: any[] = [];
      for (const m of t.tresc.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
        const abs = path.join(process.cwd(), "public", m[1]);
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: fs.readFileSync(abs).toString("base64"),
          },
        });
      }
      parts.push({
        text: `Schemat oceniania CKE (tekst z PDF):\n${t.schemat ?? ""}\n\nNapisz rozwiązanie.`,
      });
      try {
        const res = await model.generateContent(parts);
        const text = res.response.text().trim().replace(/\u2014/g, "-");
        if (text) {
          t.rozwiazanie = text;
          changed = true;
          console.log(`  ${sheet.sessionId} zad. ${t.numer} OK`);
        }
      } catch (e) {
        console.warn(`  ${sheet.sessionId} zad. ${t.numer}: ${(e as Error).message}`);
      }
      fs.writeFileSync(
        path.join(CACHE_DIR, `${sheet.sessionId}.json`),
        JSON.stringify(sheet, null, 2),
        "utf8",
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
    if (changed) console.log(`✓ ${sheet.sessionId} zapisany`);
  }
}

async function fillDzialy(delayMs: number, only?: string): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Brak GEMINI_API_KEY w .env.local");
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    systemInstruction: `Klasyfikujesz zadania z egzaminow z matematyki. Na podstawie obrazu zadania wybierz JEDEN dzial z listy: ${DZIALY_MATEMATYKI.join(", ")}. Odpowiedz wylacznie nazwa dzialu z listy, dokladnie tak jak zapisano.`,
  });

  for (const sheet of loadSheets()) {
    if (only && !sheet.sessionId.includes(only)) continue;
    let changed = false;
    for (const t of sheet.tasks) {
      if (t.dzial && (DZIALY_MATEMATYKI as readonly string[]).includes(t.dzial)) {
        continue;
      }
      const parts: any[] = [];
      for (const m of (t.tekst ? "" : t.tresc).matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
        const abs = path.join(process.cwd(), "public", m[1]);
        if (!fs.existsSync(abs)) continue;
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: fs.readFileSync(abs).toString("base64"),
          },
        });
      }
      parts.push({ text: `Tresc: ${(t.tekst ?? t.tresc).replace(/!\[[^\]]*\]\([^)]+\)/g, "")}\nDzial?` });
      try {
        const res = await model.generateContent(parts);
        const answer = res.response.text().trim().replace(/[.\s]+$/g, "");
        const found = DZIALY_MATEMATYKI.find(
          (d) => d.toLowerCase() === answer.toLowerCase(),
        );
        if (found) {
          t.dzial = found;
          changed = true;
          console.log(`  ${sheet.sessionId} zad. ${t.numer}: ${found}`);
        }
      } catch (e) {
        console.warn(`  ${sheet.sessionId} zad. ${t.numer}: ${(e as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    if (changed) {
      fs.writeFileSync(
        path.join(CACHE_DIR, `${sheet.sessionId}.json`),
        JSON.stringify(sheet, null, 2),
        "utf8",
      );
      console.log(`✓ ${sheet.sessionId} dzialy zapisane`);
    }
  }
}

async function fillTranscripts(delayMs: number, only?: string): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Brak GEMINI_API_KEY w .env.local");
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
    systemInstruction: `Przepisujesz zadanie z arkusza egzaminacyjnego CKE ze zdjecia na tekst. Odpowiedz w formacie zwyklego tekstu (NIE JSON, NIE blok kodu), dokladnie tak:
===TEKST===
(tresc zadania)
===RYSUNEK 1===
(kod SVG pierwszego rysunku)
===RYSUNEK 2===
(kod SVG drugiego rysunku, itd.; sekcji RYSUNEK nie dawaj, jesli nie ma rysunkow)
Zasady dla tresci:
- Pomin naglowek "Zadanie N. (0-2)", ramke z numerem i punktami oraz kratki na odpowiedz.
- Zwykly tekst po polsku, wzory w LaTeX: $...$ w linii, $$...$$ dla wzorow w osobnej linii. Nie uzywaj dlugich myslnikow, tylko "-".
- Akapity oddziel pusta linia.
- Zadanie zamkniete: po tresci pytania dopisz odpowiedzi w JEDNEJ linii w formacie: A) ... B) ... C) ... D) ... (kazda odpowiedz z wzorem w $...$).
- Tabele zapisz jako tabele markdown.
- Kazdy rysunek, wykres, figure lub uklad wspolrzednych zastap w tresci znacznikiem [[RYSUNEK 1]], [[RYSUNEK 2]] itd. w miejscu, gdzie sie znajduje.
Zasady dla SVG: wierne oryginalowi (te same punkty, opisy, oznaczenia, skala). Kazde SVG: <svg xmlns="http://www.w3.org/2000/svg" viewBox="..."> z bialym tlem (<rect width="100%" height="100%" rx="8" fill="#ffffff"/>), ciemne linie (#1f2937), czytelne etykiety (font-family sans-serif, font-size min 14). Bez zewnetrznych zasobow.`,
  });

  for (const sheet of loadSheets()) {
    if (only && !sheet.sessionId.includes(only)) continue;
    let changed = false;
    for (const t of sheet.tasks) {
      if (t.tekst || !/!\[[^\]]*\]\(/.test(t.tresc)) continue;
      const parts: any[] = [];
      for (const m of t.tresc.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
        const abs = path.join(process.cwd(), "public", m[1]);
        if (!fs.existsSync(abs)) continue;
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: fs.readFileSync(abs).toString("base64"),
          },
        });
      }
      if (parts.length === 0) continue;
      parts.push({ text: "Przepisz to zadanie." });
      try {
        const res = await model.generateContent(parts);
        let raw = res.response.text().replace(/```[a-z]*\n?/g, "");
        if (raw.trimStart().startsWith("{")) {
          try {
            const wrapped = JSON.parse(raw) as { text?: string };
            if (typeof wrapped.text === "string") raw = wrapped.text;
          } catch {
            // zostaw surowy tekst
          }
        }
        const sections = raw.split(/^===(TEKST|RYSUNEK \d+)===\s*$/m);
        let tekst = "";
        const figs: string[] = [];
        for (let k = 1; k + 1 < sections.length; k += 2) {
          const body = (sections[k + 1] ?? "").trim();
          if (sections[k] === "TEKST") tekst = body.replace(/\u2014/g, "-");
          else figs.push(body);
        }
        if (tekst.length < 10) {
          throw new Error(`pusty tekst: ${JSON.stringify(raw.slice(0, 200))}`);
        }
        const sid = `${sheet.sessionId}`;
        const num = String(t.numer).padStart(2, "0");
        const figDir = path.join(IMG_DIR, sid);
        fs.mkdirSync(figDir, { recursive: true });
        figs.forEach((svg, i) => {
          if (!/^\s*<svg[\s>]/i.test(svg)) return;
          const name = `z${num}-fig${i + 1}.svg`;
          fs.writeFileSync(path.join(figDir, name), svg.trim(), "utf8");
          tekst = tekst.replace(
            `[[RYSUNEK ${i + 1}]]`,
            `\n\n![Rysunek ${i + 1}](/cke-matura/${sid}/${name})\n\n`,
          );
        });
        tekst = tekst.replace(/\[\[RYSUNEK \d+\]\]/g, "");
        t.tekst = tekst;
        t.tekstV = 2;
        changed = true;
        console.log(`  ${sheet.sessionId} zad. ${t.numer} OK (rysunki: ${figs.length})`);
      } catch (e) {
        console.warn(`  ${sheet.sessionId} zad. ${t.numer}: ${(e as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    if (changed) {
      fs.writeFileSync(
        path.join(CACHE_DIR, `${sheet.sessionId}.json`),
        JSON.stringify(sheet, null, 2),
        "utf8",
      );
      console.log(`✓ ${sheet.sessionId} teksty zapisane`);
    }
  }
}

/** Dopasowuje ramke do tresci, ustala rozmiar wyswietlania i skaluje czcionki. */
async function fitSvg(page: any, svg: string): Promise<string> {
  return page.evaluate((src: string) => {
    const host = document.createElement("div");
    host.innerHTML = src;
    const el = host.querySelector("svg") as SVGSVGElement | null;
    if (!el) return src;
    document.body.appendChild(host);
    el.removeAttribute("width");
    el.removeAttribute("height");
    el.querySelector(':scope > rect[width="100%"]')?.remove();
    if (!el.getAttribute("xmlns")) {
      el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    const first = el.getBBox();
    const D = Math.min(560, Math.max(280, first.width));
    const f = first.width / D;
    const scalePx = (v: string) =>
      v.replace(/(\d+(?:\.\d+)?)/g, (n) => String(+(parseFloat(n) * f).toFixed(2)));
    el.querySelectorAll("[font-size]").forEach((n) => {
      n.setAttribute("font-size", scalePx(n.getAttribute("font-size") ?? "14"));
    });
    el.querySelectorAll("[style]").forEach((n) => {
      const st = n.getAttribute("style") ?? "";
      if (/font-size/.test(st)) {
        n.setAttribute(
          "style",
          st.replace(/font-size\s*:\s*[\d.]+/g, (m) => scalePx(m)),
        );
      }
    });
    if (!el.getAttribute("font-size")) {
      el.setAttribute("font-size", String(+(14 * f).toFixed(2)));
    }
    const b = el.getBBox();
    const pad = 12 * f;
    const x = b.x - pad;
    const y = b.y - pad;
    const w = b.width + 2 * pad;
    const h = b.height + 2 * pad;
    el.setAttribute("viewBox", `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    el.setAttribute("width", String(Math.round(w / f)));
    el.setAttribute("height", String(Math.round(h / f)));
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", x.toFixed(1));
    bg.setAttribute("y", y.toFixed(1));
    bg.setAttribute("width", w.toFixed(1));
    bg.setAttribute("height", h.toFixed(1));
    bg.setAttribute("rx", String(+(8 * f).toFixed(1)));
    bg.setAttribute("fill", "#ffffff");
    el.insertBefore(bg, el.firstChild);
    const out = el.outerHTML;
    host.remove();
    return out;
  }, svg);
}

async function renderSvg(page: any, svg: string): Promise<Buffer> {
  await page.setContent(
    `<body style="margin:0;background:#e5e7eb"><div id="w" style="display:inline-block;padding:8px">${svg}</div></body>`,
  );
  return (await page.locator("#w").screenshot()) as Buffer;
}

async function verifyFigures(only?: string): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Brak GEMINI_API_KEY w .env.local");
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    systemInstruction: `Weryfikujesz rysunek odtworzony jako SVG. Dostajesz: obraz oryginalnego zadania CKE, render SVG oraz kod SVG. Sprawdz: (1) czy geometria, punkty, oznaczenia, liczby, opisy osi i skala zgadzaja sie z oryginalem, (2) czy nic nie jest ucięte ani nie wystaje, (3) czy etykiety nie nakladaja sie na linie, punkty ani siebie nawzajem i sa umieszczone obok punktow, (4) czy wielkosc etykiet jest proporcjonalna do rysunku.
Jesli rysunek jest dobry, odpowiedz dokladnie: OK
Jesli nie, odpowiedz TYLKO poprawionym, pelnym kodem SVG (viewBox np. "0 0 400 300", tlo biale <rect>, linie #1f2937, czcionka sans-serif rozmiar 14, etykiety w niewielkiej odleglosci od punktow, bez nakladania). Bez komentarzy i bez bloku kodu.`,
  });

  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript("window.__name = (f) => f;");
  await page.goto("about:blank");
  let fixedTotal = 0;
  let okTotal = 0;
  try {
    for (const sheet of loadSheets()) {
      if (only && !sheet.sessionId.includes(only)) continue;
      const dir = path.join(IMG_DIR, sheet.sessionId);
      let changed = false;
      for (const t of sheet.tasks) {
        if (t.figOk) continue;
        const num = String(t.numer).padStart(2, "0");
        const files = fs.existsSync(dir)
          ? fs
              .readdirSync(dir)
              .filter((n) => new RegExp(`^z${num}-fig\\d+\\.svg$`).test(n))
              .sort()
          : [];
        if (files.length === 0) continue;
        const origParts: any[] = [];
        for (const m of t.tresc.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
          const abs = path.join(process.cwd(), "public", m[1]);
          if (!/\.png$/i.test(abs) || !fs.existsSync(abs)) continue;
          origParts.push({
            inlineData: {
              mimeType: "image/png",
              data: fs.readFileSync(abs).toString("base64"),
            },
          });
        }
        let allOk = true;
        for (const [idx, name] of files.entries()) {
          const file = path.join(dir, name);
          let svg = await fitSvg(page, fs.readFileSync(file, "utf8"));
          let ok = false;
          for (let round = 0; round < 3 && !ok; round++) {
            const png = await renderSvg(page, svg);
            const parts = [
              ...origParts,
              { inlineData: { mimeType: "image/png", data: png.toString("base64") } },
              {
                text: `To jest rysunek ${idx + 1} z ${files.length} w zadaniu ${t.numer}. Kod SVG:\n${svg}`,
              },
            ];
            try {
              const res = await model.generateContent(parts);
              const answer = res.response.text().trim();
              if (/^OK\b/i.test(answer)) {
                ok = true;
              } else {
                const m = answer.match(/<svg[\s\S]*<\/svg>/i);
                if (!m) break;
                svg = await fitSvg(page, m[0]);
              }
            } catch (e) {
              console.warn(`  ${sheet.sessionId} zad. ${t.numer} ${name}: ${(e as Error).message}`);
              break;
            }
            await new Promise((r) => setTimeout(r, 1500));
          }
          fs.writeFileSync(file, svg, "utf8");
          if (ok) okTotal++;
          else fixedTotal++;
          allOk = allOk && ok;
          console.log(`  ${sheet.sessionId} zad. ${t.numer} ${name}: ${ok ? "OK" : "poprawiony, do przejrzenia"}`);
        }
        if (allOk) {
          t.figOk = true;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(
          path.join(CACHE_DIR, `${sheet.sessionId}.json`),
          JSON.stringify(sheet, null, 2),
          "utf8",
        );
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`Gotowe. OK: ${okTotal}, do przejrzenia: ${fixedTotal}`);
}

async function sync(only?: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw new Error("Brak kluczy Supabase w .env.local");
  const supabase = createClient(url, key);

  for (const sheet of loadSheets()) {
    if (only && !sheet.sessionId.includes(only)) continue;
    const { data: found } = await supabase
      .from("arkusze")
      .select("id")
      .eq("nazwa", sheet.nazwa)
      .maybeSingle();
    let arkuszId = found?.id as string | undefined;
    if (!arkuszId) {
      const { data, error } = await supabase
        .from("arkusze")
        .insert({
          nazwa: sheet.nazwa,
          typ: sheet.typ ?? "egzamin-8",
          rok: sheet.rok,
          miesiac: sheet.miesiac,
        })
        .select("id")
        .single();
      if (error) throw error;
      arkuszId = data.id as string;
    }
    for (const t of sheet.tasks) {
      const sid = `${sheet.sessionId}-z${String(t.numer).padStart(2, "0")}`;
      await supabase.from("zadania").delete().eq("source_id", sid);
      const { error } = await supabase.from("zadania").insert({
        arkusz_id: arkuszId,
        numer_zadania: t.numer,
        dzial:
          t.dzial ??
          (sheet.typ === "matura"
            ? inferDzialMatura(t.tekst ?? t.tresc, t.numer)
            : "Egzamin ósmoklasisty"),
        tresc: t.tekst ?? t.tresc,
        rozwiazanie: t.rozwiazanie,
        source_id: sid,
      });
      if (error) console.warn(`  ${sid}: ${error.message}`);
    }
    console.log(`✓ ${sheet.nazwa} (${sheet.tasks.length} zadań)`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const onlyArg = args.find((a) => a.startsWith("--only="))?.split("=")[1];
  if (args.includes("--weryfikuj")) return verifyFigures(onlyArg);
  if (args.includes("--sync")) return sync(onlyArg);
  if (args.includes("--dzialy")) return fillDzialy(1500, onlyArg);
  if (args.includes("--teksty")) {
    const o = args.find((a) => a.startsWith("--only="))?.split("=")[1];
    return fillTranscripts(1500, o);
  }
  if (args.includes("--gemini")) {
    const d = args.find((a) => a.startsWith("--delay="));
    return fillSolutions(d ? Number(d.split("=")[1]) : 2500);
  }
  const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];
  for (const s of [...CKE_E8_SESSIONS, ...CKE_MATURA_R_SESSIONS, ...CKE_MATURA_P_SESSIONS]) {
    if (only && !s.id.includes(only)) continue;
    try {
      await importSession(s);
    } catch (e) {
      console.error(`  ✗ ${s.id}: ${(e as Error).message}`);
    }
  }
  console.log(`\nGotowe. Dalej: npm run seed:cke-e8 -- --gemini`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

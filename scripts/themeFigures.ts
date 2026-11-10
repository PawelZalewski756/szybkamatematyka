/**
 * Tworzy ciemne warianty (-dark.png) wycietych rysunkow CKE: przezroczyste tlo,
 * linie w kolorze tekstu strony, kolorowe elementy w kolorze akcentu.
 * Uzycie: npx tsx scripts/themeFigures.ts
 */
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "cke-matura");
const FG = [246, 241, 231];
const AC = [244, 183, 64];

async function main() {
  let n = 0;
  for (const dir of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    for (const f of fs.readdirSync(full)) {
      if (!/-fig\d+\.png$/.test(f)) continue;
      const { data, info } = await sharp(path.join(full, f))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const out = Buffer.from(data);
      for (let i = 0; i < data.length; i += 4) {
        const mn = Math.min(data[i]!, data[i + 1]!, data[i + 2]!);
        const mx = Math.max(data[i]!, data[i + 1]!, data[i + 2]!);
        const c = mx - mn > 45 ? AC : FG;
        out[i] = c[0]!;
        out[i + 1] = c[1]!;
        out[i + 2] = c[2]!;
        out[i + 3] = 255 - mn;
      }
      await sharp(out, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .png()
        .toFile(path.join(full, f.replace(/\.png$/, "-dark.png")));
      n++;
    }
  }
  console.log(`Wygenerowano ${n} ciemnych rysunkow`);
}

void main();

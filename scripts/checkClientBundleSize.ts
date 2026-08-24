import fs from "fs";
import path from "path";

const chunksDir = path.resolve(process.cwd(), ".next/static/chunks");
const maxChunkBytes = 600 * 1024;
const maxTotalBytes = 3.5 * 1024 * 1024;
const forbiddenArchiveMarker = "cke-m15-maj-z01";

if (!fs.existsSync(chunksDir)) {
  console.error("Brak .next/static/chunks — uruchom najpierw npm run build.");
  process.exit(1);
}

const files = fs
  .readdirSync(chunksDir)
  .filter((name) => name.endsWith(".js"))
  .map((name) => {
    const filePath = path.join(chunksDir, name);
    return { name, filePath, bytes: fs.statSync(filePath).size };
  });

const largest = [...files].sort((a, b) => b.bytes - a.bytes)[0];
const total = files.reduce((sum, file) => sum + file.bytes, 0);
const archiveLeaks = files.filter((file) =>
  fs.readFileSync(file.filePath, "utf8").includes(forbiddenArchiveMarker),
);

console.log("\n=== Budżet klientowego JavaScriptu ===");
console.log(
  `Największy chunk: ${largest?.name ?? "brak"} (${Math.round((largest?.bytes ?? 0) / 1024)} KB)`,
);
console.log(`Łącznie: ${Math.round(total / 1024)} KB`);
console.log(`Archiwum CKE w chunkach: ${archiveLeaks.length}`);

const failures: string[] = [];
if (largest && largest.bytes > maxChunkBytes) {
  failures.push(`największy chunk przekracza ${maxChunkBytes / 1024} KB`);
}
if (total > maxTotalBytes) {
  failures.push(`łączny JS przekracza ${Math.round(maxTotalBytes / 1024)} KB`);
}
if (archiveLeaks.length > 0) {
  failures.push("pełne archiwum CKE trafiło do klienta");
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}

console.log("✓ Budżet klientowego JavaScriptu zachowany.");


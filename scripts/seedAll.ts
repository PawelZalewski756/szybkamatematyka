/**
 * Scentralizowany pipeline produkcji treści z bramką audytu jakości.
 *
 *   npm run seed:all                    # tylko audyty (bramka jakości)
 *   npm run seed:all -- --apply         # audyty + eksport SQL + cache
 *   npm run seed:all -- --apply --cke   # + import CKE z cache (wymaga .env)
 *   npm run seed:all -- --skip-audit    # pomiń audyty (niezalecane)
 *
 * Kolejność: audyt → eksport → (opcjonalnie) push do Supabase.
 */

import { spawnSync } from "child_process";

type Step = {
  id: string;
  label: string;
  npmScript: string;
  requiresApply?: boolean;
  requiresCke?: boolean;
};

const STEPS: Step[] = [
  { id: "audit-theory", label: "Audyt pokrycia teorii", npmScript: "audit:theory" },
  { id: "audit-questions", label: "Audyt jakości zadań", npmScript: "audit:questions" },
  { id: "audit-trening", label: "Audyt zadań treningowych", npmScript: "audit:trening" },
  { id: "audit-cke", label: "Audyt rozwiązań CKE", npmScript: "audit:cke" },
  { id: "audit-tasks-cache", label: "Audyt cache zadań", npmScript: "audit:tasks-cache" },
  {
    id: "export-archive",
    label: "Eksport archiwum CKE do kodu",
    npmScript: "seed:exam-archive",
    requiresApply: true,
  },
  {
    id: "export-theory-sql",
    label: "Eksport SQL teorii",
    npmScript: "seed:theory-sql",
    requiresApply: true,
  },
  {
    id: "export-tasks-sql",
    label: "Eksport SQL zadań",
    npmScript: "seed:tasks-sql",
    requiresApply: true,
  },
  {
    id: "seed-cke",
    label: "Import arkuszy CKE do Supabase",
    npmScript: "seed:cke-matura",
    requiresApply: true,
    requiresCke: true,
  },
];

function parseArgs(): { apply: boolean; skipAudit: boolean; cke: boolean } {
  const args = process.argv.slice(2);
  return {
    apply: args.includes("--apply"),
    skipAudit: args.includes("--skip-audit"),
    cke: args.includes("--cke"),
  };
}

function runStep(script: string): boolean {
  console.log(`\n▶ npm run ${script}`);
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`\n✗ Krok ${script} zakończył się błędem (kod ${result.status})`);
    return false;
  }
  return true;
}

function main(): void {
  const { apply, skipAudit, cke } = parseArgs();

  console.log("══ Szybka Matematyka — seed:all ══");
  console.log(
    apply
      ? "Tryb: audyt + eksport" + (cke ? " + import CKE" : "")
      : "Tryb: tylko audyt (dodaj --apply aby eksportować)",
  );

  for (const step of STEPS) {
    if (step.requiresApply && !apply) continue;
    if (step.requiresCke && !cke) continue;
    if (skipAudit && step.id.startsWith("audit-")) continue;

    console.log(`\n── ${step.label} ──`);
    if (!runStep(step.npmScript)) {
      console.error("\n✗ Pipeline przerwany — popraw błędy audytu przed seedem.");
      process.exit(1);
    }
  }

  console.log("\n✓ seed:all zakończony pomyślnie.");
}

main();

/**
 * Usuwa stare deploymenty Vercel, żeby zwolnić Deployment Storage (10 GB
 * na Hobby). Domyślnie pokazuje tylko plan (--dry-run); usuwa z --apply.
 *
 * Wymagane:
 *   VERCEL_TOKEN       - token z Vercel → Account Settings → Tokens
 *   VERCEL_PROJECT_ID  - Project → Settings → General → Project ID
 * Opcjonalne:
 *   VERCEL_TEAM_ID     - jeśli projekt jest w teamie
 *   KEEP_DAYS=7        - ile dni zostawić (domyślnie 7)
 *
 *   node scripts/pruneVercelDeployments.mjs
 *   node scripts/pruneVercelDeployments.mjs --apply
 *
 * Nie usuwa:
 * - deploymentów z aliasem (domeną),
 * - 3 najnowszych produkcji i 3 najnowszych deploymentów dowolnego typu
 *   (to ochrona Vercela; usuwanie i tak zostałoby odrzucone),
 * - deploymentów nowszych niż KEEP_DAYS.
 */
const token = process.env.VERCEL_TOKEN?.trim();
const projectId = process.env.VERCEL_PROJECT_ID?.trim();
const teamId = process.env.VERCEL_TEAM_ID?.trim();
const days = Math.max(1, Number(process.env.KEEP_DAYS ?? 7));
const apply = process.argv.includes("--apply");
const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

if (!token || !projectId) {
  console.error(
    "Brak VERCEL_TOKEN / VERCEL_PROJECT_ID. Ustaw je w środowisku (nie commituj tokenu).",
  );
  process.exit(0);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

function query(params) {
  const search = new URLSearchParams(params);
  if (teamId) search.set("teamId", teamId);
  return search.toString();
}

async function listAllDeployments() {
  const all = [];
  let until = Date.now();

  for (let page = 0; page < 50; page += 1) {
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?${query({
        projectId,
        limit: "100",
        until: String(until),
      })}`,
      { headers, cache: "no-store" },
    );
    if (!response.ok) {
      throw new Error(
        `Vercel list ${response.status}: ${(await response.text()).slice(0, 300)}`,
      );
    }
    const payload = await response.json();
    const batch = Array.isArray(payload.deployments) ? payload.deployments : [];
    if (batch.length === 0) break;
    all.push(...batch);

    const oldest = Math.min(...batch.map((d) => Number(d.createdAt) || until));
    if (!Number.isFinite(oldest) || oldest >= until) break;
    until = oldest - 1;
    if (batch.length < 100) break;
  }
  return all;
}

async function deleteDeployment(deployment) {
  const response = await fetch(
    `https://api.vercel.com/v13/deployments/${encodeURIComponent(deployment.uid)}?${query({})}`,
    { method: "DELETE", headers },
  );
  if (!response.ok) {
    return `${response.status}: ${(await response.text()).slice(0, 200)}`;
  }
  return null;
}

const deployments = await listAllDeployments();
deployments.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

const protectedProduction = new Set(
  deployments
    .filter((d) => d.target === "production")
    .slice(0, 3)
    .map((d) => d.uid),
);
const protectedAny = new Set(deployments.slice(0, 3).map((d) => d.uid));

const candidates = deployments.filter((deployment) => {
  const createdAt = Number(deployment.createdAt) || 0;
  if (createdAt >= cutoff) return false;
  if (protectedProduction.has(deployment.uid)) return false;
  if (protectedAny.has(deployment.uid)) return false;
  if (Array.isArray(deployment.alias) && deployment.alias.length > 0) return false;
  if (deployment.target === "production" && deployment.alias?.length) return false;
  return true;
});

console.log(
  `Projekt: ${projectId} · deploymentów: ${deployments.length} · starsze niż ${days} dni: ${candidates.length} · tryb: ${apply ? "USUWANIE" : "dry-run"}`,
);

for (const deployment of candidates.slice(0, 100)) {
  const date = new Date(Number(deployment.createdAt)).toISOString().slice(0, 10);
  const label = `${deployment.uid} · ${date} · ${deployment.target ?? "preview"} · ${deployment.url ?? ""}`;
  if (!apply) {
    console.log(`[dry-run] ${label}`);
    continue;
  }
  const error = await deleteDeployment(deployment);
  console.log(error ? `✗ ${label} — ${error}` : `✓ ${label}`);
}

if (!apply) {
  console.log("\nAby usunąć: node scripts/pruneVercelDeployments.mjs --apply");
}

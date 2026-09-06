import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const env = { ...process.env };
delete env.NEXT_PUBLIC_SUPABASE_URL;
delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
delete env.NEXT_PUBLIC_SITE_URL;

const nextCli = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
const result = spawnSync(process.execPath, [nextCli, "build"], {
  env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);

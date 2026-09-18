// Applies a SQL file to a remote Supabase project via the Management API.
// The access token is read from SUPABASE_ACCESS_TOKEN so it is never written
// to disk.
//
// Usage:
//   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
//   node scripts/apply-remote-sql.mjs <project-ref> <sql-path>

import { readFileSync } from "node:fs";

const [, , ref, sqlPath] = process.argv;
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error("FAIL  SUPABASE_ACCESS_TOKEN is not set");
  process.exit(1);
}
if (!ref || !sqlPath) {
  console.error("FAIL  usage: node scripts/apply-remote-sql.mjs <project-ref> <sql-path>");
  process.exit(1);
}

const query = readFileSync(sqlPath, "utf8");
console.log(`Applying ${sqlPath} to project ${ref} (${query.length} chars) ...`);

const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
});

const text = await response.text();
console.log(`HTTP ${response.status}`);
console.log(text);
process.exitCode = response.ok ? 0 : 1;

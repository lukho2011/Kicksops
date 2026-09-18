// Runs an ad-hoc SQL string against the remote project via the Management API.
// Usage: $env:SUPABASE_ACCESS_TOKEN="sbp_..."; node scripts/query-remote.mjs "select 1"
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "zpshrpvpxvjeftlscwjj";
const query = process.argv[2];

if (!token || !query) {
  console.error("usage: SUPABASE_ACCESS_TOKEN=... node scripts/query-remote.mjs \"<sql>\"");
  process.exit(1);
}

const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});

console.log(`HTTP ${response.status}`);
console.log(JSON.stringify(await response.json(), null, 2));
process.exitCode = response.ok ? 0 : 1;

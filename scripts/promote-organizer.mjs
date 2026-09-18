// Promotes an existing account to organizer (and marks it active) by email.
// Run this once after the first signup to designate the workspace owner.
//
// Usage:
//   $env:SUPABASE_ACCESS_TOKEN="sbp_..."; node scripts/promote-organizer.mjs you@example.com
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "zpshrpvpxvjeftlscwjj";
const email = process.argv[2];

if (!token || !email) {
  console.error("usage: SUPABASE_ACCESS_TOKEN=... node scripts/promote-organizer.mjs <email>");
  process.exit(1);
}

const safeEmail = email.replace(/'/g, "''");
const sql = `update public.profiles set role = 'organizer', is_active = true where lower(email) = lower('${safeEmail}') returning id, email, role;`;

const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

const body = await response.json();
console.log(`HTTP ${response.status}`);
console.log(JSON.stringify(body, null, 2));

if (response.ok && Array.isArray(body) && body.length === 0) {
  console.log(`\nNo profile matched ${email}. Sign up with that email first, then re-run.`);
  process.exitCode = 1;
} else {
  process.exitCode = response.ok ? 0 : 1;
}

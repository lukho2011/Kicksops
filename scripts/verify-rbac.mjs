// Verifies the Phase 2 RBAC migration landed on the remote project: role check
// constraint, SECURITY DEFINER helpers, per-table RLS policies, and the seeded
// service catalogue. Read-only — safe to re-run.
//
// Usage: $env:SUPABASE_ACCESS_TOKEN="sbp_..."; node scripts/verify-rbac.mjs
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "zpshrpvpxvjeftlscwjj";

if (!token) {
  console.error("usage: SUPABASE_ACCESS_TOKEN=... node scripts/verify-rbac.mjs");
  process.exit(1);
}

async function query(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

const checks = [
  {
    name: "profiles.role check constraint allows the three roles",
    sql: `select pg_get_constraintdef(oid) as def from pg_constraint where conname = 'profiles_role_check';`,
    pass: (rows) => rows[0]?.def?.includes("customer") && rows[0]?.def?.includes("employee") && rows[0]?.def?.includes("organizer"),
  },
  {
    name: "helper functions exist",
    sql: `select proname from pg_proc where proname in ('current_org_id','current_user_role','is_staff','is_organizer','current_customer_id','owns_job');`,
    pass: (rows) => rows.length >= 6,
  },
  {
    name: "RLS policies exist on core tables",
    sql: `select tablename, count(*)::int as n from pg_policies where schemaname = 'public' and tablename in ('profiles','customers','service_items','jobs','order_items') group by tablename;`,
    pass: (rows) => rows.length === 5 && rows.every((r) => r.n > 0),
  },
  {
    name: "service_items seeded (>= 4 active)",
    sql: `select count(*)::int as n from public.service_items where active = true;`,
    pass: (rows) => (rows[0]?.n ?? 0) >= 4,
  },
  {
    name: "profiles has is_active + email columns",
    sql: `select column_name from information_schema.columns where table_schema='public' and table_name='profiles' and column_name in ('is_active','email');`,
    pass: (rows) => rows.length === 2,
  },
];

let failures = 0;
for (const check of checks) {
  try {
    const rows = await query(check.sql);
    const ok = check.pass(rows);
    console.log(`${ok ? "PASS" : "FAIL"}  ${check.name}`);
    if (!ok) {
      failures += 1;
      console.log(`      got: ${JSON.stringify(rows)}`);
    }
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${check.name}`);
    console.log(`      ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(failures === 0 ? "\nAll RBAC checks passed." : `\n${failures} check(s) failed.`);
process.exitCode = failures === 0 ? 0 : 1;

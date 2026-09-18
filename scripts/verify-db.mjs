// Verifies the KicksOps Supabase project end to end using the same URL and
// publishable key the app uses: resolve the demo org, read customers, create
// a customer, create a job, insert order items, move a pair to a station,
// read the job back with embedded items, then clean up.
//
// Usage: node scripts/verify-db.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadEnv() {
  const env = {};
  const content = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("FAIL  .env.local must define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);
const results = [];

function report(ok, name, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  results.push(ok);
}

function describe(error) {
  if (!error) return "unknown error";
  return error.code ? `${error.code}: ${error.message}` : String(error.message ?? error);
}

const reference = `KX-${Math.floor(1000 + Math.random() * 9000)}`;
let customerId = null;
let jobId = null;

async function main() {
  // 1. Resolve the demo org (proves orgs is readable and the seed ran).
  const { data: orgs, error: orgError } = await supabase
    .from("orgs")
    .select("id, slug")
    .eq("slug", "demo-org")
    .limit(1);

  if (orgError) {
    report(false, "resolve demo org", describe(orgError));
    return;
  }
  if (!orgs?.length) {
    report(false, "resolve demo org", "demo-org not found — apply supabase/migrations/20260918020000_phase1_foundation.sql first");
    return;
  }

  const orgId = orgs[0].id;
  report(true, "resolve demo org", orgId);

  // 2. Read customers.
  const { data: existingCustomers, error: listError } = await supabase
    .from("customers")
    .select("id, display_name")
    .limit(5);

  if (listError) {
    report(false, "read customers", describe(listError));
  } else {
    report(true, "read customers", `${existingCustomers.length} row(s) visible`);
  }

  // 3. Create a customer.
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      org_id: orgId,
      display_name: "DB Verification",
      phone: "+27000000000",
      email: "verify@example.com",
      notes: "Temporary row created by scripts/verify-db.mjs",
    })
    .select("id, display_name")
    .single();

  if (customerError || !customer) {
    report(false, "create customer", describe(customerError));
    return;
  }
  customerId = customer.id;
  report(true, "create customer", customer.display_name);

  // 4. Create a job.
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      org_id: orgId,
      customer_id: customerId,
      reference,
      order_value: 240,
      current_stage: "booked",
      priority: "normal",
    })
    .select("id, reference, current_stage")
    .single();

  if (jobError || !job) {
    report(false, "create job", describe(jobError));
    return;
  }
  jobId = job.id;
  report(true, "create job", job.reference);

  // 5. Insert order items (two pairs).
  const pairRows = ["A", "B"].map((suffix) => ({
    org_id: orgId,
    job_id: jobId,
    pair_code: `${reference}-${suffix}`,
    price: 120,
    current_station: "queue",
  }));

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .insert(pairRows)
    .select("id, pair_code, current_station");

  if (itemsError || !items?.length) {
    report(false, "insert order items", describe(itemsError));
    return;
  }
  report(true, "insert order items", items.map((item) => item.pair_code).join(", "));

  // 6. Move the first pair to the washing station.
  const { error: moveError } = await supabase
    .from("order_items")
    .update({ current_station: "washing" })
    .eq("id", items[0].id);

  if (moveError) {
    report(false, "move pair to station", describe(moveError));
  } else {
    const { data: moved, error: movedError } = await supabase
      .from("order_items")
      .select("pair_code, current_station")
      .eq("id", items[0].id)
      .single();

    if (movedError || moved?.current_station !== "washing") {
      report(false, "move pair to station", moved ? `station is ${moved.current_station}` : describe(movedError));
    } else {
      report(true, "move pair to station", `${moved.pair_code} -> washing`);
    }
  }

  // 7. Read the job back with embedded order items, like the app does.
  const { data: jobWithItems, error: embedError } = await supabase
    .from("jobs")
    .select("id, reference, order_items(id, pair_code, current_station, price)")
    .eq("id", jobId)
    .single();

  if (embedError || !jobWithItems) {
    report(false, "read job with order items", describe(embedError));
  } else {
    report(true, "read job with order items", `${jobWithItems.reference} with ${jobWithItems.order_items.length} pair(s)`);
  }
}

async function cleanup() {
  if (jobId) {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    console.log(`${error ? "WARN  cleanup job" : "CLEANUP job"} — ${error ? describe(error) : "deleted (order items cascaded)"}`);
  }
  if (customerId) {
    const { error } = await supabase.from("customers").delete().eq("id", customerId);
    console.log(`${error ? "WARN  cleanup customer" : "CLEANUP customer"} — ${error ? describe(error) : "deleted"}`);
  }
}

try {
  await main();
} catch (error) {
  report(false, "unexpected client error", describe(error));
} finally {
  await cleanup();
}

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exitCode = passed === results.length ? 0 : 1;

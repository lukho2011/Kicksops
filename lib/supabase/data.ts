import { createDemoState } from "../mvp";
import { createClient } from "./client";

const DEMO_ORG_SLUG = "demo-org";
const demoState = createDemoState();

// Maps pair stations (order_items.current_station) to job stages
// (jobs.current_stage). The job stage column has a check constraint, so the
// free-form station names must not be written to it directly.
const STATION_TO_STAGE: Record<string, string> = {
  queue: "booked",
  washing: "in_wash",
  treating: "in_treatment",
  drying: "drying",
  finishing: "finishing",
  qc: "qc",
  ready: "ready",
};

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

// Surfaces Supabase error codes (e.g. 42501 RLS violations, 54001 stack depth
// exceeded) instead of opaque objects so failures are diagnosable.
function describeError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const details = error as { code?: string; message: string };
    return details.code ? `${details.code}: ${details.message}` : details.message;
  }
  return String(error);
}

function demoCustomers() {
  return demoState.customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
  }));
}

function demoJobs() {
  return demoState.orders.map((order) => ({
    id: order.id,
    customerId: order.customerId,
    reference: order.reference,
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt,
    pairs: order.pairs.map((pair) => ({
      id: pair.id,
      tag: pair.tag,
      currentStation: pair.currentStation,
      serviceName: pair.serviceName,
      price: pair.price,
    })),
  }));
}

export async function ensureDemoOrgId() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const client = createClient();
  const { data: existingOrg, error: lookupError } = await client
    .from("orgs")
    .select("id")
    .eq("slug", DEMO_ORG_SLUG)
    .limit(1)
    .maybeSingle();

  if (lookupError && lookupError.code !== "PGRST116") {
    throw new Error(`Supabase org lookup failed (${describeError(lookupError)})`);
  }

  if (existingOrg?.id) {
    return existingOrg.id as string;
  }

  const { data: newOrg, error: insertError } = await client
    .from("orgs")
    .insert({ name: "Demo Org", slug: DEMO_ORG_SLUG })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Supabase org insert failed (${describeError(insertError)})`);
  }

  return newOrg.id as string;
}

export async function listCustomers() {
  if (!hasSupabaseConfig()) {
    return demoCustomers();
  }

  const client = createClient();
  try {
    const { data, error } = await client
      .from("customers")
      .select("id, display_name, phone, email")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase customers fetch failed (${describeError(error)})`);
    }

    return (data ?? []).map((customer) => ({
      id: customer.id,
      name: customer.display_name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
    }));
  } catch (error) {
    console.error("Supabase customers fetch failed", error);
    throw error;
  }
}

export async function createCustomerRecord(input: { name: string; phone: string; email: string }) {
  if (!hasSupabaseConfig()) {
    const newCustomer = {
      id: `cust-demo-${Date.now()}`,
      name: input.name,
      phone: input.phone,
      email: input.email,
    };
    return newCustomer;
  }

  const client = createClient();
  try {
    const orgId = await ensureDemoOrgId();
    if (!orgId) {
      throw new Error("Could not resolve the demo org.");
    }

    const { data, error } = await client
      .from("customers")
      .insert({
        org_id: orgId,
        display_name: input.name,
        phone: input.phone,
        email: input.email,
        notes: "Created from the MVP intake flow.",
      })
      .select("id, display_name, phone, email")
      .single();

    if (error) {
      throw new Error(`Supabase customer insert failed (${describeError(error)})`);
    }

    return {
      id: data.id,
      name: data.display_name,
      phone: data.phone ?? "",
      email: data.email ?? "",
    };
  } catch (error) {
    console.error("Supabase customer insert failed", error);
    throw error;
  }
}

export async function listJobs() {
  if (!hasSupabaseConfig()) {
    return demoJobs();
  }

  const client = createClient();
  try {
    const { data, error } = await client
      .from("jobs")
      .select("id, customer_id, reference, current_stage, created_at, order_items(id, pair_code, current_station, price, service_items(name))")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase jobs fetch failed (${describeError(error)})`);
    }

    return (data ?? []).map((job) => ({
      id: job.id,
      customerId: job.customer_id,
      reference: job.reference,
      status: job.current_stage,
      notes: "",
      createdAt: job.created_at,
      pairs: (job.order_items ?? []).map((item) => ({
        id: item.id,
        tag: item.pair_code,
        currentStation: item.current_station,
        serviceName: (item.service_items as { name?: string } | null)?.name ?? "Standard Deep Clean",
        price: Number(item.price),
      })),
    }));
  } catch (error) {
    console.error("Supabase jobs fetch failed", error);
    throw error;
  }
}

export async function createJobRecord(input: { customerId: string; pairCount: number; serviceName: string; notes: string }) {
  if (!hasSupabaseConfig()) {
    return {
      id: `order-demo-${Date.now()}`,
      reference: `KX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: input.customerId,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      pairs: Array.from({ length: input.pairCount }, (_, index) => ({
        id: `pair-demo-${Date.now()}-${index}`,
        tag: `KX-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + index)}`,
        currentStation: "queue",
        serviceName: input.serviceName,
        price: 120,
      })),
    };
  }

  const client = createClient();
  const reference = `KX-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const orgId = await ensureDemoOrgId();
    if (!orgId) {
      throw new Error("Could not resolve the demo org.");
    }

    const { data: job, error: jobError } = await client
      .from("jobs")
      .insert({
        org_id: orgId,
        customer_id: input.customerId,
        reference,
        order_value: input.pairCount * 120,
        current_stage: "booked",
        priority: "normal",
      })
      .select("id, customer_id, reference, current_stage, created_at")
      .single();

    if (jobError) {
      throw new Error(`Supabase job insert failed (${describeError(jobError)})`);
    }

    const pairRows = Array.from({ length: input.pairCount }, (_, index) => ({
      org_id: orgId,
      job_id: job.id,
      pair_code: `${reference}-${String.fromCharCode(65 + index)}`,
      brand: "",
      model: "",
      size: "",
      colour: "",
      material: "",
      price: 120,
      risk_accepted: false,
      current_station: "queue",
    }));

    const { data: items, error: itemsError } = await client
      .from("order_items")
      .insert(pairRows)
      .select("id, pair_code, current_station, price");

    if (itemsError) {
      throw new Error(`Supabase order items insert failed (${describeError(itemsError)})`);
    }

    return {
      id: job.id,
      reference,
      customerId: job.customer_id,
      notes: input.notes,
      createdAt: job.created_at,
      pairs: (items ?? []).map((item) => ({
        id: item.id,
        tag: item.pair_code,
        currentStation: item.current_station,
        serviceName: input.serviceName,
        price: Number(item.price),
      })),
    };
  } catch (error) {
    console.error("Supabase job insert failed", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Phase 2: role-scoped reads/writes. These run with the signed-in user's
// session (browser client), so Supabase RLS decides what each role may touch.
// ---------------------------------------------------------------------------

export type Service = {
  id: string;
  name: string;
  code: string;
  price: number;
  active: boolean;
};

function requireConfig() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured (.env.local missing URL or key).");
  }
}

// Active catalogue for the customer shop/booking flow.
export async function listServices(): Promise<Service[]> {
  requireConfig();
  const client = createClient();
  const { data, error } = await client
    .from("service_items")
    .select("id, name, code, price, active")
    .eq("active", true)
    .order("price", { ascending: false });

  if (error) {
    throw new Error(`Supabase services fetch failed (${describeError(error)})`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    price: Number(row.price),
    active: row.active,
  }));
}

// Full catalogue (including inactive) for the organizer services manager.
export async function listAllServices(): Promise<Service[]> {
  requireConfig();
  const client = createClient();
  const { data, error } = await client
    .from("service_items")
    .select("id, name, code, price, active")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Supabase services fetch failed (${describeError(error)})`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    price: Number(row.price),
    active: row.active,
  }));
}

function slugifyCode(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `service-${Date.now()}`;
}

export async function createService(input: { name: string; price: number }): Promise<Service> {
  requireConfig();
  const client = createClient();
  const orgId = await ensureDemoOrgId();
  if (!orgId) {
    throw new Error("Could not resolve the demo org.");
  }

  const { data, error } = await client
    .from("service_items")
    .insert({ org_id: orgId, name: input.name, code: slugifyCode(input.name), price: input.price, active: true })
    .select("id, name, code, price, active")
    .single();

  if (error) {
    throw new Error(`Supabase service insert failed (${describeError(error)})`);
  }

  return { id: data.id, name: data.name, code: data.code, price: Number(data.price), active: data.active };
}

export async function updateService(id: string, patch: { name?: string; price?: number; active?: boolean }): Promise<void> {
  requireConfig();
  const client = createClient();
  const { error } = await client.from("service_items").update(patch).eq("id", id);
  if (error) {
    throw new Error(`Supabase service update failed (${describeError(error)})`);
  }
}

export async function deleteService(id: string): Promise<void> {
  requireConfig();
  const client = createClient();
  const { error } = await client.from("service_items").delete().eq("id", id);
  if (error) {
    throw new Error(`Supabase service delete failed (${describeError(error)})`);
  }
}

// The signed-in customer's own CRM row (RLS returns only their record).
export async function getMyCustomer(): Promise<{ id: string; orgId: string; name: string } | null> {
  requireConfig();
  const client = createClient();
  const { data, error } = await client
    .from("customers")
    .select("id, org_id, display_name")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase customer lookup failed (${describeError(error)})`);
  }
  if (!data) {
    return null;
  }
  return { id: data.id, orgId: data.org_id, name: data.display_name };
}

// Customer creates a booking: one job (stage 'booked') plus a pair per unit.
export async function createBooking(input: {
  serviceId: string;
  serviceName: string;
  price: number;
  pairCount: number;
  notes: string;
}): Promise<{ id: string; reference: string }> {
  requireConfig();
  const client = createClient();

  const customer = await getMyCustomer();
  if (!customer) {
    throw new Error("No customer profile is linked to this account.");
  }

  const reference = `KX-${Math.floor(1000 + Math.random() * 9000)}`;
  const pairCount = Math.max(1, Math.min(6, input.pairCount));

  const { data: job, error: jobError } = await client
    .from("jobs")
    .insert({
      org_id: customer.orgId,
      customer_id: customer.id,
      reference,
      order_value: input.price * pairCount,
      current_stage: "booked",
      priority: "normal",
    })
    .select("id, reference")
    .single();

  if (jobError) {
    throw new Error(`Supabase booking failed (${describeError(jobError)})`);
  }

  const pairRows = Array.from({ length: pairCount }, (_, index) => ({
    org_id: customer.orgId,
    job_id: job.id,
    pair_code: `${reference}-${String.fromCharCode(65 + index)}`,
    service_item_id: input.serviceId,
    price: input.price,
    current_station: "queue",
  }));

  const { error: itemsError } = await client.from("order_items").insert(pairRows);
  if (itemsError) {
    throw new Error(`Supabase booking items failed (${describeError(itemsError)})`);
  }

  return { id: job.id, reference: job.reference };
}

// The signed-in customer's own orders with per-pair station status (RLS scoped).
export async function listMyOrders() {
  requireConfig();
  const client = createClient();
  const { data, error } = await client
    .from("jobs")
    .select("id, reference, current_stage, created_at, order_value, order_items(id, pair_code, current_station, price, service_items(name))")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase my-orders fetch failed (${describeError(error)})`);
  }

  return (data ?? []).map((job) => ({
    id: job.id,
    reference: job.reference,
    status: job.current_stage,
    createdAt: job.created_at,
    total: Number(job.order_value),
    pairs: (job.order_items ?? []).map((item) => ({
      id: item.id,
      tag: item.pair_code,
      currentStation: item.current_station,
      serviceName: (item.service_items as { name?: string } | null)?.name ?? "Service",
      price: Number(item.price),
    })),
  }));
}

// Organizer account management (RLS: profiles_organizer_all).
export type Account = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: "customer" | "employee" | "organizer";
  isActive: boolean;
};

export async function listAccounts(): Promise<Account[]> {
  requireConfig();
  const client = createClient();
  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Supabase accounts fetch failed (${describeError(error)})`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
  }));
}

export async function setAccountRole(id: string, role: "customer" | "employee" | "organizer"): Promise<void> {
  requireConfig();
  const client = createClient();
  const { error } = await client.from("profiles").update({ role }).eq("id", id);
  if (error) {
    throw new Error(`Supabase role update failed (${describeError(error)})`);
  }
}

export async function setAccountActive(id: string, isActive: boolean): Promise<void> {
  requireConfig();
  const client = createClient();
  const { error } = await client.from("profiles").update({ is_active: isActive }).eq("id", id);
  if (error) {
    throw new Error(`Supabase active update failed (${describeError(error)})`);
  }
}

// Deletion needs the service-role admin client, so it goes through the route.
export async function deleteAccount(userId: string): Promise<void> {
  const response = await fetch("/api/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Account deletion failed (HTTP ${response.status}).`);
  }
}

// Aggregated organizer analytics from RLS-scoped reads.
export async function getAnalytics() {
  requireConfig();
  const client = createClient();

  const [jobsResult, customersResult, servicesResult] = await Promise.all([
    client.from("jobs").select("id, current_stage, order_value, created_at, order_items(id, current_station, price, service_items(name))"),
    client.from("customers").select("id", { count: "exact", head: true }),
    client.from("service_items").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  if (jobsResult.error) {
    throw new Error(`Supabase analytics fetch failed (${describeError(jobsResult.error)})`);
  }

  const jobs = jobsResult.data ?? [];
  const stageCounts: Record<string, number> = {};
  const stationCounts: Record<string, number> = {};
  const serviceRevenue: Record<string, number> = {};
  const revenueByDay: Record<string, number> = {};
  let revenue = 0;
  let pairs = 0;

  for (const job of jobs) {
    stageCounts[job.current_stage] = (stageCounts[job.current_stage] ?? 0) + 1;
    const day = String(job.created_at).slice(0, 10);
    for (const item of job.order_items ?? []) {
      const price = Number(item.price);
      revenue += price;
      pairs += 1;
      stationCounts[item.current_station] = (stationCounts[item.current_station] ?? 0) + 1;
      const serviceName = (item.service_items as { name?: string } | null)?.name ?? "Other";
      serviceRevenue[serviceName] = (serviceRevenue[serviceName] ?? 0) + price;
      revenueByDay[day] = (revenueByDay[day] ?? 0) + price;
    }
  }

  const topServices = Object.entries(serviceRevenue)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const revenueSeries = Object.entries(revenueByDay)
    .map(([day, total]) => ({ day, total }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const activeStages = new Set(["booked", "in_wash", "in_treatment", "drying", "finishing", "qc"]);
  const activeOrders = jobs.filter((job) => activeStages.has(job.current_stage)).length;

  return {
    revenue,
    totalOrders: jobs.length,
    activeOrders,
    pairs,
    customerCount: customersResult.count ?? 0,
    serviceCount: servicesResult.count ?? 0,
    stageCounts,
    stationCounts,
    topServices,
    revenueSeries,
  };
}

export async function movePairToStationRemote(orderId: string, pairId: string, nextStation: string) {
  if (!hasSupabaseConfig()) {
    return true;
  }

  const client = createClient();
  try {
    const { error } = await client
      .from("order_items")
      .update({ current_station: nextStation })
      .eq("id", pairId);

    if (error) {
      throw new Error(`Supabase station move failed (${describeError(error)})`);
    }

    const nextStage = STATION_TO_STAGE[nextStation];
    if (orderId && nextStage) {
      const { error: stageError } = await client
        .from("jobs")
        .update({ current_stage: nextStage })
        .eq("id", orderId);

      if (stageError) {
        throw new Error(`Supabase stage update failed (${describeError(stageError)})`);
      }
    }

    return true;
  } catch (error) {
    console.error("Supabase station move failed", error);
    throw error;
  }
}

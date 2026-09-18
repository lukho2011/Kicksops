import { createDemoState } from "../mvp";
import { createClient } from "./client";

const DEMO_ORG_SLUG = "demo-org";
const demoState = createDemoState();

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
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
    throw lookupError;
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
    throw insertError;
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
      console.error("Supabase customers fetch failed", error);
      return demoCustomers();
    }

    return (data ?? []).map((customer) => ({
      id: customer.id,
      name: customer.display_name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
    }));
  } catch (error) {
    console.error("Supabase customers fetch failed", error);
    return demoCustomers();
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

  const orgId = await ensureDemoOrgId();
  if (!orgId) {
    return null;
  }

  const client = createClient();
  try {
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
      console.error("Supabase customer insert failed", error);
      return null;
    }

    return {
      id: data.id,
      name: data.display_name,
      phone: data.phone ?? "",
      email: data.email ?? "",
    };
  } catch (error) {
    console.error("Supabase customer insert failed", error);
    return null;
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
      .select("id, customer_id, reference, current_stage, created_at, order_items(id, pair_code, current_station, price)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase jobs fetch failed", error);
      return demoJobs();
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
        serviceName: "Standard Deep Clean",
        price: Number(item.price),
      })),
    }));
  } catch (error) {
    console.error("Supabase jobs fetch failed", error);
    return demoJobs();
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

  const orgId = await ensureDemoOrgId();
  if (!orgId) {
    return null;
  }

  const client = createClient();
  const reference = `KX-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
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
      console.error("Supabase job insert failed", jobError);
      return null;
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

    const { data: items, error: itemsError } = await client.from("order_items").insert(pairRows).select("id, pair_code, current_station, price");

    if (itemsError) {
      console.error("Supabase order items insert failed", itemsError);
      return null;
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
    return null;
  }
}

export async function movePairToStationRemote(orderId: string, pairId: string, nextStation: string) {
  if (!hasSupabaseConfig()) {
    return true;
  }

  const client = createClient();
  try {
    const { error } = await client.from("order_items").update({ current_station: nextStation }).eq("id", pairId);

    if (error) {
      console.error("Supabase station move failed", error);
      return false;
    }

    if (orderId) {
      await client.from("jobs").update({ current_stage: nextStation }).eq("id", orderId);
    }

    return true;
  } catch (error) {
    console.error("Supabase station move failed", error);
    return false;
  }
}

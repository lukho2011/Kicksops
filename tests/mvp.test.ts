import test from "node:test";
import assert from "node:assert/strict";

import { createDemoState, createCustomer, createOrder, movePairToStation, getStationCounts } from "../lib/mvp.ts";

test("demo state includes customers, a queue, and active orders", () => {
  const state = createDemoState();

  assert.ok(Array.isArray(state.customers));
  assert.ok(state.customers.length >= 1);
  assert.ok(Array.isArray(state.orders));
  assert.ok(state.orders.length >= 1);
  assert.ok(Array.isArray(state.stationQueue));
});

test("creating a customer adds a new row and keeps the return shape stable", () => {
  const state = createDemoState();
  const next = createCustomer(state, {
    name: "Mina Dlamini",
    phone: "+27829990001",
    email: "mina@example.com",
  });

  assert.equal(next.customers.at(-1)?.name, "Mina Dlamini");
  assert.equal(next.customers.at(-1)?.phone, "+27829990001");
});

test("creating an order generates unique physical tags and stores them in the order", () => {
  const state = createDemoState();
  const next = createOrder(state, {
    customerId: state.customers[0].id,
    pairCount: 2,
    serviceName: "Standard Deep Clean",
    notes: "Two white sneakers for Friday pickup",
  });

  assert.ok(next.orders.length >= state.orders.length + 1);
  assert.equal(next.orders.at(-1)?.pairs.length, 2);
  assert.equal(next.orders.at(-1)?.pairs[0].tag, next.orders.at(-1)?.pairs[0].tag);
  assert.notEqual(next.orders.at(-1)?.pairs[0].tag, next.orders.at(-1)?.pairs[1].tag);
});

test("moving a pair updates station state and station counts", () => {
  const state = createDemoState();
  const order = createOrder(state, {
    customerId: state.customers[0].id,
    pairCount: 1,
    serviceName: "Basic Clean",
    notes: "One pair",
  });

  const pairId = order.orders.at(-1)!.pairs[0].id;
  const moved = movePairToStation(order, order.orders.at(-1)!.id, pairId, "washing");

  assert.equal(moved.orders.at(-1)?.pairs[0].currentStation, "washing");
  assert.equal(getStationCounts(moved).washing, 1);
});

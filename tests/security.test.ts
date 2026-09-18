import test from "node:test";
import assert from "node:assert/strict";

import {
  canAccessOrg,
  canBookOrders,
  canDeleteAccount,
  canEnterPortal,
  canManageAccounts,
  canManageServices,
  getOrgIsolationError,
  isRole,
  isStaff,
  roleHome,
} from "../lib/security.ts";
import { calculateDeterministicPrice } from "../lib/pricing.ts";

test("user in org A cannot access org B records", () => {
  const userOrgIds = ["org-a"];
  assert.equal(canAccessOrg(userOrgIds, "org-a"), true);
  assert.equal(canAccessOrg(userOrgIds, "org-b"), false);
  assert.equal(getOrgIsolationError(userOrgIds, "org-b"), "Access denied: org mismatch.");
});

test("roles map to their own home route", () => {
  assert.equal(roleHome("customer"), "/shop");
  assert.equal(roleHome("employee"), "/work");
  assert.equal(roleHome("organizer"), "/admin");
});

test("isRole only accepts the three known roles", () => {
  assert.equal(isRole("customer"), true);
  assert.equal(isRole("organizer"), true);
  assert.equal(isRole("admin"), false);
  assert.equal(isRole(null), false);
});

test("staff = employee or organizer, never customer", () => {
  assert.equal(isStaff("customer"), false);
  assert.equal(isStaff("employee"), true);
  assert.equal(isStaff("organizer"), true);
});

test("only customers book; only organizers manage services and accounts", () => {
  assert.equal(canBookOrders("customer"), true);
  assert.equal(canBookOrders("employee"), false);
  assert.equal(canManageServices("organizer"), true);
  assert.equal(canManageServices("employee"), false);
  assert.equal(canManageAccounts("organizer"), true);
  assert.equal(canManageAccounts("customer"), false);
});

test("account deletion: self always, others only by organizer", () => {
  assert.equal(canDeleteAccount("customer", true), true);
  assert.equal(canDeleteAccount("employee", false), false);
  assert.equal(canDeleteAccount("organizer", false), true);
});

test("portal entry: customers stay out of staff/organizer areas", () => {
  assert.equal(canEnterPortal("customer", "customer"), true);
  assert.equal(canEnterPortal("customer", "staff"), false);
  assert.equal(canEnterPortal("employee", "staff"), true);
  assert.equal(canEnterPortal("employee", "organizer"), false);
  assert.equal(canEnterPortal("organizer", "organizer"), true);
});

test("manual pricing stays deterministic and protected from AI", () => {
  const base = calculateDeterministicPrice({
    serviceId: "basic-clean",
    addOns: ["sole-whitening"],
    quantity: 2,
    assessment: { material: "canvas", soilLevel: 4, damageFlags: ["yellowing"] },
  });

  assert.equal(base, 300);
});

test("invalid pricing inputs fail validation", () => {
  assert.throws(() => {
    calculateDeterministicPrice({
      serviceId: "",
      addOns: [],
      quantity: 0,
      assessment: { material: "canvas", soilLevel: 0, damageFlags: [] },
    });
  });
});

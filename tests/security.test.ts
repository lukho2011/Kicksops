import test from "node:test";
import assert from "node:assert/strict";

import { canAccessOrg, getOrgIsolationError } from "../lib/security.ts";
import { calculateDeterministicPrice } from "../lib/pricing.ts";

test("user in org A cannot access org B records", () => {
  const userOrgIds = ["org-a"];
  assert.equal(canAccessOrg(userOrgIds, "org-a"), true);
  assert.equal(canAccessOrg(userOrgIds, "org-b"), false);
  assert.equal(getOrgIsolationError(userOrgIds, "org-b"), "Access denied: org mismatch.");
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

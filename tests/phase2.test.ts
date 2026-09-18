import test from "node:test";
import assert from "node:assert/strict";

import { generatePairCode, generatePairCodes, createIntakeDraft } from "../lib/intake.ts";

test("tag generation produces unique physical pair tags", () => {
  assert.equal(generatePairCode("KX-1183", 1), "KX-1183-A");
  assert.equal(generatePairCode("KX-1183", 2), "KX-1183-B");
  assert.equal(generatePairCode("KX-1183", 3), "KX-1183-C");
  assert.deepEqual(generatePairCodes("KX-1183", 3), ["KX-1183-A", "KX-1183-B", "KX-1183-C"]);
});

test("intake draft captures customer and pair metadata", () => {
  const draft = createIntakeDraft({
    customerName: "Lukho",
    phone: "+27821234567",
    pairCount: 2,
    requestNotes: "Two pairs for Friday pickup",
  });

  assert.equal(draft.customerName, "Lukho");
  assert.equal(draft.pairs.length, 2);
  assert.equal(draft.pairs[0].tagCode, "KX-" + draft.reference.slice(3, 7) + "-A");
  assert.equal(draft.requestNotes, "Two pairs for Friday pickup");
});

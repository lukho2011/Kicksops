# Phase 2 Documentation

## Goal

Build the operational intake flow required for KicksOps to function before AI is layered in:

- customer creation and lookup
- order creation
- pair registration
- tag generation
- photo intake

## Scope delivered

### Customer management
- Customer directory UI with name and phone search
- Intake form for new order drafting
- Customer summary cards for quick lookup

### Intake workflow
- Customer name and phone capture
- Pair count selection
- Intake notes / copied WhatsApp message support
- Generated pair tag preview before order finalization
- Photo intake placeholders ready for real upload implementation

### Tag logic
- Pair codes are generated deterministically using a prefix and numeric index
- Example pattern: `KX-1183-A`, `KX-1183-B`, `KX-1183-C`

### Core helpers
- `generatePairCode`
- `generatePairCodes`
- `createIntakeDraft`

## File list

- [lib/intake.ts](../lib/intake.ts)
- [app/orders/new/page.tsx](../app/orders/new/page.tsx)
- [app/customers/page.tsx](../app/customers/page.tsx)
- [tests/phase2.test.ts](../tests/phase2.test.ts)

## Validation

The Phase 2 helper logic was verified with:

```bash
npm test
```

This passed for the tag generation and intake draft tests.

## Notes

This phase purposely stops before AI assessment and pricing logic is introduced. The operational workflow is now in place and is ready to be extended with human-confirmed AI triage in the next phase.

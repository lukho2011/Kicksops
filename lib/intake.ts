export function generatePairCode(prefix: string, index: number): string {
  const suffix = String.fromCharCode(65 + (index - 1));
  return `${prefix}-${suffix}`;
}

export function generatePairCodes(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => generatePairCode(prefix, index + 1));
}

export function createIntakeDraft(input: {
  customerName: string;
  phone: string;
  pairCount: number;
  requestNotes: string;
}) {
  const serial = String(Math.floor(1000 + Math.random() * 9000));
  const reference = `KX-${serial}`;
  const pairCodes = generatePairCodes(reference, input.pairCount);

  return {
    reference,
    customerName: input.customerName,
    phone: input.phone,
    pairCount: input.pairCount,
    requestNotes: input.requestNotes,
    pairs: pairCodes.map((tagCode, index) => ({
      id: `${reference}-${index + 1}`,
      tagCode,
      brand: "",
      model: "",
      size: "",
      colour: "",
      material: "",
      soilLevel: 1,
      damageFlags: [],
      status: "queued",
    })),
  };
}

type PriceArgs = {
  serviceId: string;
  addOns: string[];
  quantity: number;
  assessment: {
    material: string | null;
    soilLevel: number;
    damageFlags: string[];
  };
};

const SERVICE_PRICE_MAP: Record<string, number> = {
  "crocs-and-slide-wash": 35,
  "shoe-polish": 40,
  "sole-whitening": 70,
  "basic-clean": 80,
  "standard-deep-clean": 100,
};

const ADDON_PRICE_MAP: Record<string, number> = {
  "sole-whitening": 70,
  "shoe-polish": 40,
  "stain-treatment": 25,
};

export function calculateDeterministicPrice({
  serviceId,
  addOns,
  quantity,
  assessment,
}: PriceArgs): number {
  if (!serviceId || quantity <= 0) {
    throw new Error("Invalid pricing input.");
  }

  if (assessment.soilLevel < 1 || assessment.soilLevel > 5) {
    throw new Error("Soil level must be between 1 and 5.");
  }

  const servicePrice = SERVICE_PRICE_MAP[serviceId] ?? 0;
  const addOnPrice = addOns.reduce(
    (total, addOn) => total + (ADDON_PRICE_MAP[addOn] ?? 0),
    0,
  );

  return (servicePrice + addOnPrice) * quantity;
}

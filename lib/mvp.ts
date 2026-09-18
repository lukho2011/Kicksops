export type StationName = "queue" | "washing" | "treating" | "drying" | "finishing" | "qc" | "ready";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type OrderPair = {
  id: string;
  tag: string;
  brand: string;
  model: string;
  size: string;
  colour: string;
  material: string;
  currentStation: StationName;
  serviceName: string;
  price: number;
};

export type Order = {
  id: string;
  customerId: string;
  reference: string;
  status: string;
  notes: string;
  pairs: OrderPair[];
  createdAt: string;
};

export type DemoState = {
  customers: Customer[];
  orders: Order[];
  stationQueue: string[];
};

export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
  if (!cleaned) return "+27000000000";
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export function generatePairCode(ref: string, index: number): string {
  const suffix = String.fromCharCode(65 + (index - 1));
  return `${ref}-${suffix}`;
}

export function generateReference(): string {
  return `KX-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function createDemoState(): DemoState {
  return {
    customers: [
      { id: "cust-1", name: "Lukho Mokoena", phone: "+27821234567", email: "lukho@example.com" },
      { id: "cust-2", name: "Aisha Naidoo", phone: "+27714441198", email: "aisha@example.com" },
    ],
    orders: [
      {
        id: "order-1",
        customerId: "cust-1",
        reference: "KX-1183",
        status: "queued",
        notes: "Two pairs for Friday pickup",
        createdAt: new Date().toISOString(),
        pairs: [
          { id: "pair-1", tag: "KX-1183-A", brand: "Nike", model: "Air Force 1", size: "7", colour: "White", material: "Leather", currentStation: "queue", serviceName: "Standard Deep Clean", price: 100 },
          { id: "pair-2", tag: "KX-1183-B", brand: "Adidas", model: "Superstar", size: "6", colour: "White", material: "Leather", currentStation: "queue", serviceName: "Basic Clean", price: 80 },
        ],
      },
    ],
    stationQueue: ["KX-1183-A", "KX-1183-B"],
  };
}

export function createCustomer(state: DemoState, input: { name: string; phone: string; email: string }): DemoState {
  const nextCustomer: Customer = {
    id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    phone: normalizePhoneNumber(input.phone),
    email: input.email,
  };

  return {
    ...state,
    customers: [...state.customers, nextCustomer],
  };
}

export function createOrder(
  state: DemoState,
  input: { customerId: string; pairCount: number; serviceName: string; notes: string },
): DemoState {
  const reference = generateReference();
  const pairs = Array.from({ length: input.pairCount }, (_, index) => ({
    id: `pair-${Date.now()}-${index + 1}`,
    tag: generatePairCode(reference, index + 1),
    brand: "",
    model: "",
    size: "",
    colour: "",
    material: "",
    currentStation: "queue" as StationName,
    serviceName: input.serviceName,
    price: 100,
  }));

  const order: Order = {
    id: `order-${Date.now()}`,
    customerId: input.customerId,
    reference,
    status: "queued",
    notes: input.notes,
    createdAt: new Date().toISOString(),
    pairs,
  };

  return {
    ...state,
    orders: [...state.orders, order],
    stationQueue: [...state.stationQueue, ...pairs.map((pair) => pair.tag)],
  };
}

export function movePairToStation(state: DemoState, orderId: string, pairId: string, nextStation: StationName): DemoState {
  return {
    ...state,
    orders: state.orders.map((order) => {
      if (order.id !== orderId) return order;

      return {
        ...order,
        status: nextStation,
        pairs: order.pairs.map((pair) => {
          if (pair.id !== pairId) return pair;
          return { ...pair, currentStation: nextStation };
        }),
      };
    }),
  };
}

export function getStationCounts(state: DemoState): Record<StationName, number> {
  const counts = {
    queue: 0,
    washing: 0,
    treating: 0,
    drying: 0,
    finishing: 0,
    qc: 0,
    ready: 0,
  } as Record<StationName, number>;

  for (const order of state.orders) {
    for (const pair of order.pairs) {
      counts[pair.currentStation] += 1;
    }
  }

  return counts;
}

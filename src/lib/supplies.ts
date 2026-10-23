export type SupplyId = "map" | "layers" | "radio" | "food" | "kit" | "rope";

export interface Supply {
  id: SupplyId;
  name: string;
  cost: number;
  helps: string;
}

export const SUPPLY_BUDGET = 10;

export const SUPPLIES: readonly Supply[] = [
  { id: "map", name: "Trail map", cost: 3, helps: "Know the route" },
  { id: "layers", name: "Warm layers", cost: 3, helps: "Survive the cold" },
  { id: "radio", name: "Weather radio", cost: 2, helps: "Hear about changes" },
  { id: "food", name: "Extra food", cost: 2, helps: "Keep your energy" },
  { id: "kit", name: "Emergency kit", cost: 3, helps: "For the unexpected" },
  { id: "rope", name: "Rope + ice axe", cost: 4, helps: "For steep sections" },
];

export function suppliesCost(ids: readonly SupplyId[]) {
  return ids.reduce((sum, id) => sum + (SUPPLIES.find((s) => s.id === id)?.cost ?? 0), 0);
}

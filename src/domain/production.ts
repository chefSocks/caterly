export type RollupRow = {
  name: string;
  quantity: number;
  unit: string;
};

type RecipeLineLike = {
  ingredient: string;
  quantity: unknown;
  unit: string;
};

type PackingLineLike = {
  equipment: string;
  quantity: unknown;
  unit: string;
};

type EventItemLike = {
  quantity: unknown;
  menuItem?: {
    recipeLines?: RecipeLineLike[];
    packingLines?: PackingLineLike[];
  } | null;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object" && "toString" in value) {
    return Number(String(value)) || 0;
  }
  return 0;
}

function add(
  rollup: Map<string, { name: string; quantity: number; unit: string }>,
  name: string,
  quantity: number,
  unit: string,
) {
  const key = `${name}|${unit}`;
  const existing = rollup.get(key);
  rollup.set(key, {
    name,
    quantity: (existing?.quantity ?? 0) + quantity,
    unit,
  });
}

function rows(rollup: Map<string, RollupRow>): RollupRow[] {
  return [...rollup.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildProductionRollups(items: EventItemLike[]) {
  const ingredients = new Map<string, RollupRow>();
  const equipment = new Map<string, RollupRow>();

  for (const item of items) {
    const itemQuantity = toNumber(item.quantity);
    for (const line of item.menuItem?.recipeLines ?? []) {
      add(ingredients, line.ingredient, toNumber(line.quantity) * itemQuantity, line.unit);
    }
    for (const line of item.menuItem?.packingLines ?? []) {
      add(equipment, line.equipment, toNumber(line.quantity) * itemQuantity, line.unit);
    }
  }

  return {
    ingredients: rows(ingredients),
    equipment: rows(equipment),
  };
}

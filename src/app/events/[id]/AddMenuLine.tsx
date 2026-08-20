"use client";

import { useMemo, useState } from "react";
import { Button, Field, Input, Select } from "@/components/ui";

export type MenuOption = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
};

export function AddMenuLine({
  action,
  menuItems,
  guestCount,
}: {
  action: (data: FormData) => Promise<void>;
  menuItems: MenuOption[];
  guestCount: number;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [custom, setCustom] = useState(false);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? menuItems.filter(
          (item) =>
            item.name.toLowerCase().includes(needle) ||
            item.category.toLowerCase().includes(needle),
        )
      : menuItems;
    return filtered.slice(0, 50);
  }, [menuItems, query]);

  const selected = menuItems.find((item) => item.id === selectedId);

  return (
    <form
      action={async (data) => {
        await action(data);
        setSelectedId("");
        setQuery("");
      }}
      className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_100px_120px_auto] sm:items-end"
    >
      {custom ? (
        <>
          <Field label="Custom line">
            <Input name="name" placeholder="Chef's late-night snack" required />
          </Field>
          <Field label="Qty">
            <Input name="quantity" type="number" step="0.01" defaultValue={1} />
          </Field>
          <Field label="Unit price">
            <Input name="unitPrice" type="number" step="0.01" defaultValue={0} />
          </Field>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Menu item</span>
            <Input
              placeholder="Type to search the menu…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select
              name="menuItemId"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              required
              size={1}
            >
              <option value="">— Select an item —</option>
              {matches.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · ${item.price.toFixed(2)} {item.unit}
                </option>
              ))}
            </Select>
          </div>
          <Field label="Qty">
            <Input
              name="quantity"
              type="number"
              step="0.01"
              key={selectedId}
              defaultValue={
                selected?.unit === "per person" || !selected ? guestCount || 1 : 1
              }
            />
          </Field>
          <div className="text-sm text-slate-500 sm:pb-2">
            {selected ? `$${selected.price.toFixed(2)} ${selected.unit}` : ""}
          </div>
        </>
      )}
      <div className="flex gap-2">
        <Button type="submit">Add</Button>
        <Button type="button" variant="ghost" onClick={() => setCustom(!custom)}>
          {custom ? "From menu" : "Custom line"}
        </Button>
      </div>
    </form>
  );
}

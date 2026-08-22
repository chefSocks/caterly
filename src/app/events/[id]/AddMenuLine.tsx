"use client";

import { useState } from "react";
import { AsyncSearchSelect, type AsyncSearchOption } from "@/components/AsyncSearchSelect";
import { Button, Field, Input } from "@/components/ui";

export function AddMenuLine({
  action,
  guestCount,
}: {
  action: (data: FormData) => Promise<void>;
  guestCount: number;
}) {
  const [selected, setSelected] = useState<AsyncSearchOption | null>(null);
  const [custom, setCustom] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const defaultQuantity =
    selected?.unit === "per person" || !selected ? Math.max(guestCount, 1) : 1;

  return (
    <form
      action={async (data) => {
        await action(data);
        setSelected(null);
        setResetKey((current) => current + 1);
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
          <Field
            label="Menu item"
            hint="Type at least 2 characters. Caterly searches the menu instead of loading the entire library."
          >
            <AsyncSearchSelect
              key={resetKey}
              name="menuItemId"
              endpoint="/api/search?type=menu-items"
              placeholder="Search menu item…"
              onChange={setSelected}
            />
          </Field>
          <Field label="Qty">
            <Input
              name="quantity"
              type="number"
              step="0.01"
              key={`${selected?.id ?? "none"}-${defaultQuantity}`}
              defaultValue={defaultQuantity}
            />
          </Field>
          <div className="text-sm text-slate-500 sm:pb-2">
            {selected?.price != null
              ? `$${selected.price.toFixed(2)} ${selected.unit ?? ""}`
              : ""}
          </div>
        </>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={!custom && !selected}>
          Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setCustom(!custom);
            setSelected(null);
            setResetKey((current) => current + 1);
          }}
        >
          {custom ? "From menu" : "Custom line"}
        </Button>
      </div>
    </form>
  );
}

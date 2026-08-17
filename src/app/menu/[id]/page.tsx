import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { money, titleCase } from "@/lib/format";
import { num } from "@/lib/event-summary";
import { MenuCategory } from "@/generated/prisma/enums";
import {
  addPackingLine,
  addRecipeLine,
  deleteMenuItem,
  deletePackingLine,
  deleteRecipeLine,
  updateMenuItem,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await db.menuItem.findUnique({
    where: { id },
    include: {
      recipeLines: { orderBy: { ingredient: "asc" } },
      packingLines: { orderBy: { equipment: "asc" } },
      _count: { select: { eventItems: true } },
    },
  });
  if (!item) notFound();

  const categories = Object.values(MenuCategory) as string[];
  const recipeCost = item.recipeLines.length;

  return (
    <>
      <PageHeader
        title={item.name}
        subtitle={`${titleCase(item.category)} · ${money(num(item.price))} ${item.unit} · used on ${item._count.eventItems} events`}
        action={
          <form action={deleteMenuItem.bind(null, item.id)}>
            <Button variant="danger" type="submit">
              Delete
            </Button>
          </form>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Item details">
          <form action={updateMenuItem.bind(null, item.id)} className="space-y-3">
            <Field label="Name">
              <Input name="name" defaultValue={item.name} required />
            </Field>
            <Field label="Category">
              <Select name="category" defaultValue={item.category}>
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {titleCase(value)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Unit">
              <Input name="unit" defaultValue={item.unit} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={num(item.price)}
                />
              </Field>
              <Field label="Food cost">
                <Input
                  name="cost"
                  type="number"
                  step="0.01"
                  defaultValue={num(item.cost)}
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea name="description" defaultValue={item.description ?? ""} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={item.active} />
              Active (available when building event menus)
            </label>
            <Button type="submit">Save item</Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card title={`Recipe (${recipeCost} ingredients)`}>
            <form
              action={addRecipeLine.bind(null, item.id)}
              className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_80px_80px_auto] sm:items-end"
            >
              <Field label="Ingredient">
                <Input name="ingredient" required />
              </Field>
              <Field label="Qty">
                <Input name="quantity" type="number" step="0.001" defaultValue={1} />
              </Field>
              <Field label="Unit">
                <Input name="unit" defaultValue="g" />
              </Field>
              <Button type="submit">Add</Button>
            </form>
            {item.recipeLines.length === 0 ? (
              <EmptyState>No ingredients yet.</EmptyState>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {item.recipeLines.map((line) => (
                  <li key={line.id} className="flex items-center justify-between gap-2">
                    <span>
                      {line.ingredient}{" "}
                      <span className="text-slate-400">
                        {num(line.quantity)} {line.unit} / unit
                      </span>
                    </span>
                    <form action={deleteRecipeLine.bind(null, line.id)}>
                      <Button variant="ghost" type="submit">
                        ✕
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Packing list">
            <form
              action={addPackingLine.bind(null, item.id)}
              className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_80px_80px_auto] sm:items-end"
            >
              <Field label="Equipment">
                <Input name="equipment" required />
              </Field>
              <Field label="Qty">
                <Input name="quantity" type="number" step="0.001" defaultValue={1} />
              </Field>
              <Field label="Unit">
                <Input name="unit" defaultValue="ea" />
              </Field>
              <Button type="submit">Add</Button>
            </form>
            {item.packingLines.length === 0 ? (
              <EmptyState>No equipment yet.</EmptyState>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {item.packingLines.map((line) => (
                  <li key={line.id} className="flex items-center justify-between gap-2">
                    <span>
                      {line.equipment}{" "}
                      <span className="text-slate-400">
                        {num(line.quantity)} {line.unit} / unit
                      </span>
                    </span>
                    <form action={deletePackingLine.bind(null, line.id)}>
                      <Button variant="ghost" type="submit">
                        ✕
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

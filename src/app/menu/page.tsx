import Link from "next/link";
import { db } from "@/lib/db";
import {
  Badge,
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
import { createMenuItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const categories = Object.values(MenuCategory) as string[];

  const items = await db.menuItem.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      ...(category && categories.includes(category)
        ? { category: category as MenuCategory }
        : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { _count: { select: { recipeLines: true, packingLines: true } } },
  });

  return (
    <>
      <PageHeader
        title="Menu library"
        subtitle={`${items.length} items`}
        action={
          <Link href="/menu/packages">
            <Button variant="secondary">Packages</Button>
          </Link>
        }
      />

      <form className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <Input name="q" placeholder="Search menu items…" defaultValue={q ?? ""} />
        <Select name="category" defaultValue={category ?? ""}>
          <option value="">All categories</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </Select>
        <Button variant="secondary" type="submit">
          Filter
        </Button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Items">
          {items.length === 0 ? (
            <EmptyState>No menu items yet.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Item</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4 text-right">Price</th>
                    <th className="py-2 pr-4 text-right">Cost</th>
                    <th className="py-2 pr-4 text-right">Margin</th>
                    <th className="py-2">Recipe</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const price = num(item.price);
                    const cost = num(item.cost);
                    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-2 pr-4 font-medium">
                          <Link className="hover:underline" href={`/menu/${item.id}`}>
                            {item.name}
                          </Link>
                          {!item.active && (
                            <span className="ml-2 text-xs text-slate-400">inactive</span>
                          )}
                          <span className="block text-xs text-slate-400">
                            {item.unit}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-slate-500">
                          {titleCase(item.category)}
                        </td>
                        <td className="py-2 pr-4 text-right">{money(price)}</td>
                        <td className="py-2 pr-4 text-right text-slate-500">
                          {money(cost)}
                        </td>
                        <td className="py-2 pr-4 text-right">{margin.toFixed(0)}%</td>
                        <td className="py-2">
                          <Badge tone={item._count.recipeLines > 0 ? "green" : "slate"}>
                            {item._count.recipeLines} ing · {item._count.packingLines} eq
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Add menu item">
          <form action={createMenuItem} className="space-y-3">
            <Field label="Name">
              <Input name="name" required />
            </Field>
            <Field label="Category">
              <Select name="category" defaultValue="ENTREE">
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {titleCase(value)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Unit">
              <Select name="unit" defaultValue="per person">
                <option value="per person">per person</option>
                <option value="each">each</option>
                <option value="per dozen">per dozen</option>
                <option value="per tray">per tray</option>
                <option value="per hour">per hour</option>
                <option value="flat">flat</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <Input name="price" type="number" step="0.01" required />
              </Field>
              <Field label="Food cost">
                <Input name="cost" type="number" step="0.01" defaultValue={0} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea name="description" />
            </Field>
            <Button type="submit">Add item</Button>
          </form>
        </Card>
      </div>
    </>
  );
}

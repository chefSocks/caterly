import { db } from "@/lib/db";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { money, titleCase } from "@/lib/format";
import { num } from "@/lib/event-summary";
import { createPackage, deletePackage } from "../actions";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const [packages, items] = await Promise.all([
    db.menuPackage.findMany({
      orderBy: { name: "asc" },
      include: { items: { include: { menuItem: true } } },
    }),
    db.menuItem.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Menu packages"
        subtitle="Per-guest packages you can drop onto an event in one click."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Packages">
          {packages.length === 0 ? (
            <EmptyState>No packages yet.</EmptyState>
          ) : (
            <ul className="space-y-4">
              {packages.map((pkg) => (
                <li
                  key={pkg.id}
                  className="border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {pkg.name}{" "}
                        <span className="text-slate-500">
                          {money(num(pkg.pricePerGuest))} / guest
                        </span>
                      </p>
                      {pkg.description && (
                        <p className="text-sm text-slate-500">{pkg.description}</p>
                      )}
                      <ul className="mt-1 text-sm text-slate-500">
                        {pkg.items.map((item) => (
                          <li key={item.id}>
                            • {item.menuItem.name}{" "}
                            <span className="text-xs text-slate-400">
                              {titleCase(item.menuItem.category)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <form action={deletePackage.bind(null, pkg.id)}>
                      <Button variant="ghost" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="New package">
          <form action={createPackage} className="space-y-3">
            <Field label="Name">
              <Input name="name" required />
            </Field>
            <Field label="Price per guest">
              <Input name="pricePerGuest" type="number" step="0.01" required />
            </Field>
            <Field label="Description">
              <Textarea name="description" />
            </Field>
            <Field label="Included items">
              <select
                name="menuItemIds"
                multiple
                size={12}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {titleCase(item.category)} — {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit">Create package</Button>
          </form>
        </Card>
      </div>
    </>
  );
}

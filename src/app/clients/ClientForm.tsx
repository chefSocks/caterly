import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

type ClientValues = {
  type: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  notes: string | null;
};

export function ClientForm({
  action,
  client,
  submitLabel,
}: {
  action: (data: FormData) => Promise<void>;
  client?: ClientValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <Card title="Client details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <Select name="type" defaultValue={client?.type ?? "COMPANY"}>
              <option value="COMPANY">Company</option>
              <option value="PERSON">Person</option>
            </Select>
          </Field>
          <Field label="Name">
            <Input name="name" required defaultValue={client?.name ?? ""} />
          </Field>
          <Field label="Primary contact">
            <Input name="contactName" defaultValue={client?.contactName ?? ""} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={client?.email ?? ""} />
          </Field>
          <Field label="Phone">
            <Input name="phone" defaultValue={client?.phone ?? ""} />
          </Field>
          <Field label="Address">
            <Input name="address" defaultValue={client?.address ?? ""} />
          </Field>
          <Field label="City">
            <Input name="city" defaultValue={client?.city ?? ""} />
          </Field>
          <Field label="Province / State">
            <Input name="region" defaultValue={client?.region ?? ""} />
          </Field>
          <Field label="Postal code">
            <Input name="postalCode" defaultValue={client?.postalCode ?? ""} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea name="notes" defaultValue={client?.notes ?? ""} />
          </Field>
        </div>
      </Card>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

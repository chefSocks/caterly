import { PageHeader } from "@/components/ui";
import { ClientForm } from "../ClientForm";
import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="New client" />
      <div className="max-w-3xl">
        <ClientForm action={createClient} submitLabel="Create client" />
      </div>
    </>
  );
}

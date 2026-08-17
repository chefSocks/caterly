"use client";

import { useState } from "react";
import { Button, Card, Field, Input, Select, Textarea, cn } from "@/components/ui";

type Option = { id: string; name: string };

const steps = ["Client", "Event details", "Menu & terms"] as const;

export function BookingWizard({
  action,
  clients,
  venues,
  packages,
  defaultClientId,
  defaultDate,
}: {
  action: (data: FormData) => Promise<void>;
  clients: Option[];
  venues: Option[];
  packages: (Option & { pricePerGuest: number })[];
  defaultClientId?: string;
  defaultDate: string;
}) {
  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [newClientName, setNewClientName] = useState("");
  const [name, setName] = useState("");

  const clientStepValid = clientId !== "" || newClientName.trim() !== "";
  const detailsValid = name.trim() !== "";

  return (
    <form action={action} className="space-y-4">
      <ol className="flex flex-wrap gap-2 text-sm">
        {steps.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition",
                index === step
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      <div className={step === 0 ? "block" : "hidden"}>
        <Card title="Who is this event for?">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Existing client" className="sm:col-span-2">
              <Select
                name="clientId"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                <option value="">— New client —</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </Field>
            {clientId === "" && (
              <>
                <Field label="New client name">
                  <Input
                    name="newClientName"
                    value={newClientName}
                    onChange={(event) => setNewClientName(event.target.value)}
                    required
                  />
                </Field>
                <Field label="Contact name">
                  <Input name="newClientContact" />
                </Field>
                <Field label="Email">
                  <Input name="newClientEmail" type="email" />
                </Field>
                <Field label="Phone">
                  <Input name="newClientPhone" />
                </Field>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className={step === 1 ? "block" : "hidden"}>
        <Card title="Event details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event name" className="sm:col-span-2">
              <Input
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Smith wedding reception"
                required
              />
            </Field>
            <Field label="Event type">
              <Input name="eventType" placeholder="Wedding, corporate lunch…" />
            </Field>
            <Field label="Service style">
              <Select name="serviceType" defaultValue="BUFFET">
                <option value="DROP_OFF">Drop-off</option>
                <option value="BUFFET">Buffet</option>
                <option value="PLATED">Plated</option>
                <option value="FAMILY_STYLE">Family style</option>
                <option value="COCKTAIL">Cocktail</option>
                <option value="STATIONS">Stations</option>
              </Select>
            </Field>
            <Field label="Guest count">
              <Input name="guestCount" type="number" min={0} defaultValue={50} />
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue="TENTATIVE">
                <option value="PROSPECTIVE">Prospective</option>
                <option value="TENTATIVE">Tentative</option>
                <option value="DEFINITE">Definite</option>
              </Select>
            </Field>
            <Field label="Start">
              <Input
                name="startAt"
                type="datetime-local"
                required
                defaultValue={`${defaultDate}T17:00`}
              />
            </Field>
            <Field label="End">
              <Input
                name="endAt"
                type="datetime-local"
                required
                defaultValue={`${defaultDate}T22:00`}
              />
            </Field>
            <Field label="Staff arrival">
              <Input name="arrivalAt" type="datetime-local" />
            </Field>
            <Field label="Venue">
              <Select name="venueId" defaultValue="">
                <option value="">— Off-site / client address —</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Room / area">
              <Input name="room" />
            </Field>
            <Field label="Site address" className="sm:col-span-2">
              <Input name="siteAddress" />
            </Field>
          </div>
        </Card>
      </div>

      <div className={step === 2 ? "block" : "hidden"}>
        <Card title="Menu & terms">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Start from a package"
              hint="Adds a priced package line for every guest. You can refine the menu after booking."
              className="sm:col-span-2"
            >
              <Select name="packageId" defaultValue="">
                <option value="">— Build the menu manually —</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} · ${pkg.pricePerGuest.toFixed(2)}/guest
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Service charge %">
              <Input name="serviceChargePct" type="number" step="0.5" defaultValue={20} />
            </Field>
            <Field label="Tax %">
              <Input name="taxPct" type="number" step="0.5" defaultValue={13} />
            </Field>
            <Field label="Client notes" className="sm:col-span-2">
              <Textarea name="clientNotes" />
            </Field>
            <Field label="Kitchen notes" className="sm:col-span-2">
              <Textarea name="kitchenNotes" />
            </Field>
            <Field label="Staff notes" className="sm:col-span-2">
              <Textarea name="staffNotes" />
            </Field>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={step === 0 ? !clientStepValid : !detailsValid}
          >
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={!clientStepValid || !detailsValid}>
            Book event
          </Button>
        )}
      </div>
    </form>
  );
}

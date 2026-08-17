export function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function optionalText(data: FormData, key: string): string | null {
  const value = text(data, key);
  return value === "" ? null : value;
}

export function number(data: FormData, key: string, fallback = 0): number {
  const value = Number(text(data, key));
  return Number.isFinite(value) ? value : fallback;
}

export function optionalNumber(data: FormData, key: string): number | null {
  const raw = text(data, key);
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function bool(data: FormData, key: string): boolean {
  const value = data.get(key);
  return value === "on" || value === "true" || value === "1";
}

/** datetime-local / date inputs are stored as wall-clock time in UTC. */
export function dateTime(data: FormData, key: string): Date {
  return new Date(`${text(data, key)}:00.000Z`);
}

export function optionalDateTime(data: FormData, key: string): Date | null {
  const raw = text(data, key);
  return raw === "" ? null : new Date(`${raw}:00.000Z`);
}

export function optionalDate(data: FormData, key: string): Date | null {
  const raw = text(data, key);
  return raw === "" ? null : new Date(`${raw}T00:00:00.000Z`);
}

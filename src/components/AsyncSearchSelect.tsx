"use client";

import { useEffect, useRef, useState } from "react";
import { Input, cn } from "@/components/ui";

export type AsyncSearchOption = {
  id: string;
  label: string;
  description?: string | null;
};

export function AsyncSearchSelect({
  name,
  endpoint,
  placeholder,
  emptyLabel = "No matches",
  defaultOption,
  onChange,
}: {
  name: string;
  endpoint: string;
  placeholder: string;
  emptyLabel?: string;
  defaultOption?: AsyncSearchOption | null;
  onChange?: (option: AsyncSearchOption | null) => void;
}) {
  const [query, setQuery] = useState(defaultOption?.label ?? "");
  const [selected, setSelected] = useState<AsyncSearchOption | null>(defaultOption ?? null);
  const [options, setOptions] = useState<AsyncSearchOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestId = useRef(0);

  useEffect(() => {
    const needle = query.trim();
    if (selected && needle === selected.label) {
      setOptions([]);
      setOpen(false);
      return;
    }
    if (needle.length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }

    const id = ++requestId.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const separator = endpoint.includes("?") ? "&" : "?";
        const response = await fetch(
          `${endpoint}${separator}q=${encodeURIComponent(needle)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { results?: AsyncSearchOption[] };
        if (requestId.current !== id) return;
        const next = data.results ?? [];
        setOptions(next);
        setActiveIndex(next.length ? 0 : -1);
        setOpen(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError" && requestId.current === id) {
          setOptions([]);
          setOpen(true);
        }
      } finally {
        if (requestId.current === id) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [endpoint, query, selected]);

  function choose(option: AsyncSearchOption) {
    setSelected(option);
    setQuery(option.label);
    setOptions([]);
    setOpen(false);
    onChange?.(option);
  }

  function clearSelection(nextQuery: string) {
    if (selected) {
      setSelected(null);
      onChange?.(null);
    }
    setQuery(nextQuery);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <Input
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        onFocus={() => {
          if (options.length || query.trim().length >= 2) setOpen(true);
        }}
        onChange={(event) => clearSelection(event.target.value)}
        onKeyDown={(event) => {
          if (!open || options.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => Math.min(current + 1, options.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
          } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            choose(options[activeIndex]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      />

      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {loading ? (
            <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">{emptyLabel}</p>
          ) : (
            options.map((option, index) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-left text-sm",
                  index === activeIndex
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
              >
                <span className="block font-medium">{option.label}</span>
                {option.description && (
                  <span className="block truncate text-xs text-slate-500">
                    {option.description}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

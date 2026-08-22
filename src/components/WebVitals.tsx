"use client";

import { useReportWebVitals } from "next/web-vitals";

const enabled = process.env.NEXT_PUBLIC_CATERLY_PERF_LOG === "1";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (!enabled) return;

    console.info(
      JSON.stringify({
        type: "caterly.web_vital",
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      }),
    );
  });

  return null;
}

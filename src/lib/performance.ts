const enabled = process.env.CATERLY_PERF_LOG === "1";

export async function measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
  if (!enabled) return operation();

  const startedAt = performance.now();
  try {
    return await operation();
  } finally {
    const durationMs = performance.now() - startedAt;
    console.info(
      JSON.stringify({
        type: "caterly.server_timing",
        name,
        durationMs: Number(durationMs.toFixed(1)),
      }),
    );
  }
}

export function measureSync<T>(name: string, operation: () => T): T {
  if (!enabled) return operation();

  const startedAt = performance.now();
  try {
    return operation();
  } finally {
    const durationMs = performance.now() - startedAt;
    console.info(
      JSON.stringify({
        type: "caterly.server_timing",
        name,
        durationMs: Number(durationMs.toFixed(1)),
      }),
    );
  }
}

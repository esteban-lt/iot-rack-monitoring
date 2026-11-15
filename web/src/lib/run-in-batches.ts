export interface BatchResult {
  done: number;
  failed: number;
}

// Runs a few requests at a time and counts failures instead of stopping at the first one
export const runInBatches = async <T>(items: T[], task: (item: T) => Promise<unknown>, size = 5): Promise<BatchResult> => {
  let failed = 0;

  for (let i = 0; i < items.length; i += size) {
    const results = await Promise.allSettled(items.slice(i, i + size).map(task));
    failed += results.filter(({ status }) => status === 'rejected').length;
  }

  if (failed === items.length) throw new Error('All requests failed');
  return { done: items.length - failed, failed };
}

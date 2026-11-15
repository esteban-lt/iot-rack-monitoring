import { describe, expect, it } from 'vitest';
import { runInBatches } from '@/lib/run-in-batches';

const failOn = (bad: number[]) => async (item: number) => {
  if (bad.includes(item)) throw new Error(`failed ${item}`);
};

describe('runInBatches', () => {
  it('counts done and failed items instead of stopping at the first error', async () => {
    await expect(runInBatches([1, 2, 3, 4], failOn([2, 4]))).resolves.toEqual({ done: 2, failed: 2 });
  });

  it('runs at most `size` tasks at the same time', async () => {
    let running = 0;
    let peak = 0;
    const task = async () => {
      peak = Math.max(peak, ++running);
      await new Promise((resolve) => setTimeout(resolve, 1));
      running--;
    };

    await runInBatches(Array.from({ length: 12 }, (_, i) => i), task, 5);
    expect(peak).toBe(5);
  });

  it('throws when every task fails', async () => {
    await expect(runInBatches([1, 2], failOn([1, 2]))).rejects.toThrow('All requests failed');
  });
});

import { deviceApi } from '@/app/devices/api/device-api';
import type { HistoryRange, RackHistory, TelemetryPoint } from '../interfaces/rack-history';

const HOUR_IN_MS = 60 * 60 * 1000;

const RANGES: Record<HistoryRange, { durationMs: number; intervalMs: number }> = {
  '1h': { durationMs: HOUR_IN_MS, intervalMs: 60 * 1000 },
  '6h': { durationMs: 6 * HOUR_IN_MS, intervalMs: 5 * 60 * 1000 },
  '24h': { durationMs: 24 * HOUR_IN_MS, intervalMs: 15 * 60 * 1000 },
  '7d': { durationMs: 7 * 24 * HOUR_IN_MS, intervalMs: HOUR_IN_MS },
};

const TELEMETRY_FIELDS = {
  tilt: 'tilt',
  tilt_x: 'tiltX',
  tilt_y: 'tiltY',
  vib_rms: 'vibRms',
} as const;

export const getRackHistoryAction = async (nodeId: string, range: HistoryRange): Promise<RackHistory> => {
  const { durationMs, intervalMs } = RANGES[range];
  const endTs = Date.now();
  const startTs = endTs - durationMs;

  const [telemetry, impacts] = await Promise.all([
    deviceApi.getTelemetryHistory(nodeId, Object.keys(TELEMETRY_FIELDS), { startTs, endTs, interval: intervalMs, agg: 'AVG' }),
    deviceApi.getTelemetryHistory(nodeId, ['impact_g'], { startTs, endTs, agg: 'NONE' }),
  ]);

  const points = new Map<number, TelemetryPoint>();
  Object.entries(TELEMETRY_FIELDS).forEach(([key, field]) => {
    telemetry[key]?.forEach(({ ts, value }) => {
      points.set(ts, { ...points.get(ts), ts, [field]: Number(value) });
    });
  });

  return {
    telemetry: [...points.values()].sort((a, b) => a.ts - b.ts),
    impacts: (impacts.impact_g ?? [])
      .map(({ ts, value }) => ({ ts, impactG: Number(value) }))
      .sort((a, b) => a.ts - b.ts),
  };
}

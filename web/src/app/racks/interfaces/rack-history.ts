import type { ImpactEvent } from '@/interfaces/impact-event';

export type HistoryRange = '1h' | '6h' | '24h' | '7d';

export interface TelemetryPoint {
  ts: number;
  tilt?: number;
  tiltX?: number;
  tiltY?: number;
  vibRms?: number;
}

export interface RackHistory {
  telemetry: TelemetryPoint[];
  impacts: ImpactEvent[];
}

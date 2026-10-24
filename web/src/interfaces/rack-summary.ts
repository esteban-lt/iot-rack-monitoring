import type { Rack } from './rack';
import type { ImpactEvent } from './impact-event';
import type { NodeStatus, TelemetrySample } from './telemetry-sample';

export type RackStatus = NodeStatus | 'offline';

export interface RackSummary {
  rack: Rack;
  status: RackStatus;
  latest?: TelemetrySample;
  lastImpact?: ImpactEvent;
  activeAlarms: number;
}

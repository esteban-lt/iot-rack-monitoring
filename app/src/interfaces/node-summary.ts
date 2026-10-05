import type { Node } from './node';
import type { TelemetrySample } from './telemetry-sample';

export interface NodeSummary {
  node: Node;
  latest?: TelemetrySample;
}
